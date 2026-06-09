import os
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.conf import settings
from django.db import connection
from django.http import JsonResponse, FileResponse, HttpResponseForbidden, Http404

# -------------------------------------------------------------------
# CUSTOM PERMISSIONS
# -------------------------------------------------------------------
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin/staff users to write/modify objects,
    but allow read-only operations to anyone.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsAdminOrCreateOnly(permissions.BasePermission):
    """
    Custom permission to allow public POST/creation (e.g. contact forms, job apps),
    but restrict listing/detail/updating/deleting to admin/staff users.
    """
    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        return request.user and request.user.is_staff


from .models import (
    CareerApplication, ContactMessage, Offer, OfferPDF, SiteSettings,
    BrandLogo, Project, ProjectImage, TeamMember
)
from .serializers import (
    CareerApplicationSerializer,
    ContactMessageSerializer,
    OfferSerializer,
    OfferPDFSerializer,
    SiteSettingsSerializer,
    BrandLogoSerializer,
    ProjectSerializer,
    ProjectImageSerializer,
    TeamMemberSerializer
)


# -------------------------------------------------------------------
# OFFER VIEWSET (MULTIPLE PDFs + OPTIONAL THUMBNAILS)
# -------------------------------------------------------------------
class OfferViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = OfferSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        # Automatically delete expired offers
        from django.utils import timezone
        expired_offers = Offer.objects.filter(expire_date__lt=timezone.now())
        if expired_offers.exists():
            expired_offers.delete()
        return Offer.objects.all().prefetch_related("pdfs").order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = OfferSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        offer = serializer.save()

        pdf_files = request.FILES.getlist("pdfs")
        thumbnail = request.FILES.get("thumbnail")
        for i, pdf in enumerate(pdf_files):
            if i == 0 and thumbnail:
                OfferPDF.objects.create(offer=offer, pdf_file=pdf, thumbnail=thumbnail)
            else:
                OfferPDF.objects.create(offer=offer, pdf_file=pdf)

        return Response({
            "message": "Offer created successfully",
            "offer": OfferSerializer(offer, context={"request": request}).data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = OfferSerializer(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        offer = serializer.save()

        pdf_files = request.FILES.getlist("pdfs")
        thumbnail = request.FILES.get("thumbnail")
        for i, pdf in enumerate(pdf_files):
            if i == 0 and thumbnail:
                OfferPDF.objects.create(offer=offer, pdf_file=pdf, thumbnail=thumbnail)
            else:
                OfferPDF.objects.create(offer=offer, pdf_file=pdf)

        # If only thumbnail is updated for the existing PDF
        if thumbnail and not pdf_files:
            first_pdf = offer.pdfs.first()
            if first_pdf:
                first_pdf.thumbnail = thumbnail
                first_pdf.save()

        return Response({
            "message": "Offer updated successfully",
            "offer": OfferSerializer(offer, context={"request": request}).data
        }, status=status.HTTP_200_OK)


    @action(detail=True, methods=["get"])
    def pdfs(self, request, pk=None):
        offer = self.get_object()
        pdf_files = offer.pdfs.all()
        serializer = OfferPDFSerializer(pdf_files, many=True, context={"request": request})
        return Response({"pdfs": serializer.data})

# -------------------------------------------------------------------
# CAREER APPLICATION VIEWSET
# -------------------------------------------------------------------
class CareerApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrCreateOnly]
    queryset = CareerApplication.objects.all().order_by('-created_at')
    serializer_class = CareerApplicationSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        app = serializer.save()

        # Build CV absolute URL
        cv_url = getattr(app.cv, 'url', None)
        if cv_url:
            try:
                cv_url = request.build_absolute_uri(cv_url)
            except Exception:
                cv_url = "Unable to build CV URL"

        # Send notification email
        subject = f"New Career Application from {app.name}"
        body = f"""
A new career application has been submitted.

Name: {app.name}
Email: {app.email}
Phone: {app.phone}

Message:
{app.message}

CV Link:
{cv_url or "No CV uploaded"}
"""
        
        # Get recipient email dynamically from SiteSettings
        try:
            settings_obj = SiteSettings.objects.first()
            if settings_obj and settings_obj.careers_email_recipient:
                recipient = [settings_obj.careers_email_recipient]
            else:
                recipient = ["leptisgroupsit@gmail.com"]
        except Exception:
            recipient = ["leptisgroupsit@gmail.com"]

        try:
            send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, recipient)
        except Exception as e:
            print("Email sending failed:", e)

        return Response({
            "message": "Application submitted successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


# -------------------------------------------------------------------
# SITE SETTINGS VIEWSET
# -------------------------------------------------------------------
class SiteSettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def list(self, request):
        settings_obj = SiteSettings.objects.first()
        if not settings_obj:
            settings_obj = SiteSettings.objects.create()  # auto-create with default values
        serializer = SiteSettingsSerializer(settings_obj, context={"request": request})
        return Response(serializer.data)

    def create(self, request):
        settings_obj = SiteSettings.objects.first()
        if not settings_obj:
            settings_obj = SiteSettings.objects.create()
        serializer = SiteSettingsSerializer(settings_obj, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# -------------------------------------------------------------------
# CONTACT MESSAGE VIEWSET
# -------------------------------------------------------------------
class ContactMessageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrCreateOnly]
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        msg = serializer.save()

        # Send notification email
        subject = f"New Contact Message: {msg.subject or 'No Subject'}"
        body = f"""
You have received a new contact form message.

Name: {msg.name}
Email: {msg.email}
Subject: {msg.subject}
Message:
{msg.message}
"""
        recipient = ["leptisgroupsit@gmail.com"]
        try:
            send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, recipient)
        except Exception as e:
            print("Email sending failed:", e)

        return Response({
            "message": "Message sent successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


# -------------------------------------------------------------------
# BRAND LOGO VIEWSET
# -------------------------------------------------------------------
class BrandLogoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = BrandLogo.objects.all().order_by("-created_at")
    serializer_class = BrandLogoSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]


# -------------------------------------------------------------------
# PROJECT VIEWSET
# -------------------------------------------------------------------
class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Project.objects.all().prefetch_related("images").order_by("-created_at")
    serializer_class = ProjectSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]


# -------------------------------------------------------------------
# PROJECT IMAGE (GALLERY) VIEWSET
# -------------------------------------------------------------------
class ProjectImageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = ProjectImage.objects.all().order_by("created_at")
    serializer_class = ProjectImageSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]


# -------------------------------------------------------------------
# TEAM MEMBER VIEWSET
# -------------------------------------------------------------------
class TeamMemberViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = TeamMember.objects.all().order_by("-created_at")
    serializer_class = TeamMemberSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]


# -------------------------------------------------------------------
# HEALTH CHECK VIEW
# -------------------------------------------------------------------
def health_check(request):
    status_data = {
        "status": "healthy",
        "database": "ok",
        "message": "All systems operational"
    }
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        status_data["status"] = "unhealthy"
        status_data["database"] = f"unreachable: {str(e)}"
        status_data["message"] = "Database check failed"
    
    return JsonResponse(status_data)


# -------------------------------------------------------------------
# SECURE CV SERVING VIEW
# -------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def serve_secure_cv(request, filename):
    """
    Serve CV PDFs only if the request has a valid admin/staff token
    or if the requesting user is authenticated as staff in the session.
    """
    token_key = request.GET.get('token')
    user = None

    if token_key:
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
        except Token.DoesNotExist:
            pass

    if not user and request.user and request.user.is_authenticated:
        user = request.user

    if not (user and user.is_staff):
        return HttpResponseForbidden("You do not have permission to access this secure file.")

    file_path = os.path.join(settings.MEDIA_ROOT, 'cvs', filename)
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
    
    raise Http404("CV not found.")



