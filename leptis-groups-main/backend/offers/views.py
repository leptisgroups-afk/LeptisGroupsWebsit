import os
from django.contrib.auth import authenticate
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
    CareerApplication, ContactMessage, Event, EventPDF, SiteSettings,
    BrandLogo, Project, ProjectImage, TeamMember, Branch, AdminOTP,
    BlockedIP, FailedLoginAttempt, TimelineMilestone, BusinessVertical, Strength
)
from .serializers import (
    CareerApplicationSerializer,
    ContactMessageSerializer,
    EventSerializer,
    EventPDFSerializer,
    SiteSettingsSerializer,
    BrandLogoSerializer,
    ProjectSerializer,
    ProjectImageSerializer,
    TeamMemberSerializer,
    BranchSerializer,
    BlockedIPSerializer,
    TimelineMilestoneSerializer,
    BusinessVerticalSerializer,
    StrengthSerializer
)


# -------------------------------------------------------------------
# BRANCH VIEWSET
# -------------------------------------------------------------------
class BranchViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Branch.objects.all().order_by("name")
    serializer_class = BranchSerializer
    parser_classes = [JSONParser]


# -------------------------------------------------------------------
# EVENT VIEWSET (MULTIPLE PDFs + OPTIONAL THUMBNAILS)
# -------------------------------------------------------------------
class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = EventSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        # Automatically delete expired events
        from django.utils import timezone
        expired_events = Event.objects.filter(expire_date__lt=timezone.now())
        if expired_events.exists():
            expired_events.delete()
        return Event.objects.all().prefetch_related("pdfs").order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = EventSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        event = serializer.save()

        pdf_files = request.FILES.getlist("pdfs")
        thumbnail = request.FILES.get("thumbnail")
        for i, pdf in enumerate(pdf_files):
            if i == 0 and thumbnail:
                EventPDF.objects.create(event=event, pdf_file=pdf, thumbnail=thumbnail)
            else:
                EventPDF.objects.create(event=event, pdf_file=pdf)

        return Response({
            "message": "Event created successfully",
            "event": EventSerializer(event, context={"request": request}).data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = EventSerializer(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        event = serializer.save()

        pdf_files = request.FILES.getlist("pdfs")
        thumbnail = request.FILES.get("thumbnail")
        for i, pdf in enumerate(pdf_files):
            if i == 0 and thumbnail:
                EventPDF.objects.create(event=event, pdf_file=pdf, thumbnail=thumbnail)
            else:
                EventPDF.objects.create(event=event, pdf_file=pdf)

        # If only thumbnail is updated for the existing PDF
        if thumbnail and not pdf_files:
            first_pdf = event.pdfs.first()
            if first_pdf:
                first_pdf.thumbnail = thumbnail
                first_pdf.save()

        return Response({
            "message": "Event updated successfully",
            "event": EventSerializer(event, context={"request": request}).data
        }, status=status.HTTP_200_OK)


    @action(detail=True, methods=["get"])
    def pdfs(self, request, pk=None):
        event = self.get_object()
        pdf_files = event.pdfs.all()
        serializer = EventPDFSerializer(pdf_files, many=True, context={"request": request})
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
    # Get client IP
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({"status": "healthy"}, status=200)
    except Exception as e:
        return JsonResponse({"status": "unhealthy", "error": str(e)}, status=500)


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


# -------------------------------------------------------------------
# ADMIN OTP LOGIN VIEWS & FIREWALL HELPERS
# -------------------------------------------------------------------
import random
import uuid
from django.utils import timezone

def _get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def _register_failed_attempt(ip, username):
    FailedLoginAttempt.objects.create(ip_address=ip, username=username)
    fifteen_minutes_ago = timezone.now() - timezone.timedelta(minutes=15)
    failed_count = FailedLoginAttempt.objects.filter(
        ip_address=ip,
        attempted_at__gte=fifteen_minutes_ago
    ).count()
    if failed_count >= 5:
        BlockedIP.objects.get_or_create(
            ip_address=ip,
            defaults={"reason": "Automatic block: 5 failed login attempts within 15 minutes"}
        )
        print(f"\n[FIREWALL SECURITY] IP {ip} has been automatically blocked due to brute-force protection.\n")

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    ip = _get_client_ip(request)

    # Check if already blocked (as a fallback safety)
    if BlockedIP.objects.filter(ip_address=ip).exists():
        return Response({"detail": "Access denied by security firewall. Your IP is blocked."}, status=status.HTTP_403_FORBIDDEN)

    if not username or not password:
        return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if user is not None:
        if not user.is_staff:
            _register_failed_attempt(ip, username)
            return Response({"detail": "Access restricted to admin/staff users only."}, status=status.HTTP_403_FORBIDDEN)
        
        # Generate 6-digit OTP
        otp = f"{random.randint(100000, 999999)}"
        
        # Delete previous active OTPs for this user
        AdminOTP.objects.filter(user=user).delete()
        
        otp_record = AdminOTP.objects.create(
            user=user,
            otp=otp
        )

        # Print OTP to terminal for debug/testing
        print(f"\n[SECURITY OTP] Generated verification code for admin '{user.username}': {otp}\n")

        # Determine email recipient
        recipient_email = user.email
        if not recipient_email:
            # Fallback to SiteSettings email recipient
            site_settings = SiteSettings.objects.first()
            if site_settings and site_settings.careers_email_recipient:
                recipient_email = site_settings.careers_email_recipient
            else:
                recipient_email = "leptisgroupsit@gmail.com"

        # Send email with OTP code
        subject = "Admin Login Verification Code"
        body = f"Hello {user.username},\n\nYour admin portal verification code is: {otp}\n\nThis code will expire in 5 minutes."
        
        try:
            send_mail(
                subject,
                body,
                settings.DEFAULT_FROM_EMAIL,
                [recipient_email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"[ERROR] Failed to send OTP verification email: {e}")

        return Response({
            "otp_required": True,
            "session_key": str(otp_record.session_key)
        }, status=status.HTTP_200_OK)

    # Failed credentials
    _register_failed_attempt(ip, username or "unknown")
    return Response({"detail": "Invalid username or password."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_otp(request):
    session_key = request.data.get('session_key')
    otp = request.data.get('otp')
    ip = _get_client_ip(request)

    # Check if already blocked (as a fallback safety)
    if BlockedIP.objects.filter(ip_address=ip).exists():
        return Response({"detail": "Access denied by security firewall. Your IP is blocked."}, status=status.HTTP_403_FORBIDDEN)

    if not session_key or not otp:
        return Response({"detail": "Verification session key and OTP code are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        otp_record = AdminOTP.objects.get(session_key=session_key, is_verified=False)
    except AdminOTP.DoesNotExist:
        _register_failed_attempt(ip, "otp_session_failed")
        return Response({"detail": "Invalid verification code or session."}, status=status.HTTP_400_BAD_REQUEST)

    if otp_record.otp != otp:
        _register_failed_attempt(ip, otp_record.user.username)
        return Response({"detail": "Invalid verification code."}, status=status.HTTP_400_BAD_REQUEST)

    # Check OTP expiration (5 minutes)
    elapsed_time = timezone.now() - otp_record.created_at
    if elapsed_time.total_seconds() > 300:
        otp_record.delete()
        _register_failed_attempt(ip, otp_record.user.username)
        return Response({"detail": "Verification code has expired. Please request a new code."}, status=status.HTTP_400_BAD_REQUEST)

    user = otp_record.user
    otp_record.delete() # Consume OTP so it cannot be reused

    # Generate or retrieve authentication token
    token, created = Token.objects.get_or_create(user=user)
    return Response({
        "token": token.key
    }, status=status.HTTP_200_OK)


# -------------------------------------------------------------------
# FIREWALL BLOCKED IPS VIEWSET
# -------------------------------------------------------------------
class BlockedIPViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    queryset = BlockedIP.objects.all().order_by("-blocked_at")
    serializer_class = BlockedIPSerializer
    parser_classes = [JSONParser]


# -------------------------------------------------------------------
# TIMELINE MILESTONE VIEWSET
# -------------------------------------------------------------------
class TimelineMilestoneViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = TimelineMilestone.objects.all().order_by("order", "year")
    serializer_class = TimelineMilestoneSerializer
    parser_classes = [JSONParser]


# -------------------------------------------------------------------
# BUSINESS VERTICAL VIEWSET
# -------------------------------------------------------------------
class BusinessVerticalViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = BusinessVertical.objects.all().order_by("order", "created_at")
    serializer_class = BusinessVerticalSerializer
    parser_classes = [JSONParser]


# -------------------------------------------------------------------
# STRENGTH VIEWSET
# -------------------------------------------------------------------
class StrengthViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Strength.objects.all().order_by("order", "created_at")
    serializer_class = StrengthSerializer
    parser_classes = [JSONParser]




