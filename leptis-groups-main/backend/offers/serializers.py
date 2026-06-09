from rest_framework import serializers
from .models import (
    CareerApplication, ContactMessage, Offer, OfferPDF, SiteSettings,
    BrandLogo, Project, ProjectImage, TeamMember
)




# -------------------------------------------------------------------
# OFFER IMAGE SERIALIZER
# -------------------------------------------------------------------
class OfferPDFSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = OfferPDF
        fields = ["id", "pdf_file", "thumbnail", "pdf_url", "thumbnail_url"]

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.pdf_file.url) if request else obj.pdf_file.url
        return None

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return None


# -------------------------------------------------------------------
# OFFER SERIALIZER
# -------------------------------------------------------------------
class OfferSerializer(serializers.ModelSerializer):
    pdfs = OfferPDFSerializer(many=True, read_only=True)

    class Meta:
        model = Offer
        fields = ["id", "title", "category", "expire_date", "created_at", "pdfs"]


# -------------------------------------------------------------------
# CAREER APPLICATION SERIALIZER
# -------------------------------------------------------------------
class CareerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerApplication
        fields = ['id', 'name', 'phone', 'email', 'message', 'cv', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_cv(self, value):
        """
        Ensure CV is a PDF file and check file size (max 15MB)
        """
        # Check file type
        if hasattr(value, 'content_type') and value.content_type != 'application/pdf' and not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError("CV must be a PDF file.")
        # Check file size (max 15MB)
        max_size = 15 * 1024 * 1024  # 15MB
        if hasattr(value, 'size') and value.size > max_size:
            raise serializers.ValidationError("CV file too large. Max size is 15MB.")
        return value


# -------------------------------------------------------------------
# SITE SETTINGS SERIALIZER
# -------------------------------------------------------------------
class SiteSettingsSerializer(serializers.ModelSerializer):
    hero_bg_url = serializers.SerializerMethodField()
    about_team_img_url = serializers.SerializerMethodField()
    home_about_img_url = serializers.SerializerMethodField()
    consult_img_url = serializers.SerializerMethodField()
    careers_bg_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = '__all__'

    def get_hero_bg_url(self, obj):
        if obj.hero_bg:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.hero_bg.url) if request else obj.hero_bg.url
        return None

    def get_about_team_img_url(self, obj):
        if obj.about_team_img:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.about_team_img.url) if request else obj.about_team_img.url
        return None

    def get_home_about_img_url(self, obj):
        if obj.home_about_img:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.home_about_img.url) if request else obj.home_about_img.url
        return None

    def get_consult_img_url(self, obj):
        if obj.consult_img:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.consult_img.url) if request else obj.consult_img.url
        return None

    def get_careers_bg_url(self, obj):
        if obj.careers_bg:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.careers_bg.url) if request else obj.careers_bg.url
        return None


# -------------------------------------------------------------------
# CONTACT MESSAGE SERIALIZER
# -------------------------------------------------------------------
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']


# -------------------------------------------------------------------
# BRAND LOGO SERIALIZER
# -------------------------------------------------------------------
class BrandLogoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = BrandLogo
        fields = ["id", "name", "image", "image_url", "created_at"]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


# -------------------------------------------------------------------
# PROJECT IMAGE (GALLERY) SERIALIZER
# -------------------------------------------------------------------
class ProjectImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectImage
        fields = ["id", "project", "title", "image", "image_url", "created_at"]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


# -------------------------------------------------------------------
# PROJECT SERIALIZER
# -------------------------------------------------------------------
class ProjectSerializer(serializers.ModelSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    main_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["id", "title", "main_image", "main_image_url", "images", "created_at"]

    def get_main_image_url(self, obj):
        if obj.main_image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.main_image.url) if request else obj.main_image.url
        return None


# -------------------------------------------------------------------
# TEAM MEMBER SERIALIZER
# -------------------------------------------------------------------
class TeamMemberSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = ["id", "name", "position", "image", "image_url", "facebook_url", "twitter_url", "youtube_url", "created_at"]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


