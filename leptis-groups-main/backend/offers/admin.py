from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    CareerApplication, ContactMessage, Event, EventPDF, SiteSettings,
    BrandLogo, Project, ProjectImage, TeamMember, Branch
)




# -----------------------------
# Site Settings Admin (Singleton)
# -----------------------------
@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'established_year', 'employee_count', 'contact_email')
    
    def has_add_permission(self, request):
        # Only allow adding if there are no instances
        return SiteSettings.objects.count() == 0

    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of the global settings
        return False


# -----------------------------
# Career Application Admin
# -----------------------------
@admin.register(CareerApplication)
class CareerApplicationAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'created_at')
    readonly_fields = ('created_at',)


# -----------------------------
# Contact Message Admin
# -----------------------------
@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at')
    readonly_fields = ('created_at',)


# -----------------------------
# Event PDF Inline (multiple PDFs per Event)
# -----------------------------
class EventPDFInline(admin.TabularInline):
    model = EventPDF
    extra = 0
    fields = ("pdf_file", "thumbnail", "preview_pdf")
    readonly_fields = ("preview_pdf",)

    def preview_pdf(self, obj):
        if not obj.pk:
            return "Save the event first to see PDFs."
        if obj.thumbnail:
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-width:120px; max-height:120px;" />'
                '</a>',
                obj.pdf_file.url, obj.thumbnail.url
            )
        return format_html('<a href="{}" target="_blank">View PDF</a>', obj.pdf_file.url)
    preview_pdf.short_description = "PDF Preview"


# -----------------------------
# Event Admin
# -----------------------------
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "created_at", "pdf_previews")
    list_filter = ("category",)
    search_fields = ("title",)
    inlines = [EventPDFInline]

    class Media:
        css = {"all": ("admin/css/custom_admin.css",)}
        js = ("admin/js/offer_pdf_modal.js",)

    def pdf_previews(self, obj):
        pdf_files = obj.pdfs.all()
        if pdf_files.exists():
            html = ""
            for pdf in pdf_files:
                if pdf.thumbnail:
                    html += f'<a href="{pdf.pdf_file.url}" target="_blank">' \
                            f'<img src="{pdf.thumbnail.url}" style="max-width:50px; max-height:50px; margin-right:2px;" />' \
                            f'</a>'
                else:
                    html += f'<a href="{pdf.pdf_file.url}" target="_blank">PDF</a> '
            return format_html(html)
        return "No PDFs"
    pdf_previews.short_description = "PDFs"


# -----------------------------
# Brand Logo Admin
# -----------------------------
@admin.register(BrandLogo)
class BrandLogoAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at", "preview_image")
    search_fields = ("name",)

    def preview_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width:50px; max-height:50px;" />', obj.image.url)
        return "No Image"
    preview_image.short_description = "Preview"


# -----------------------------
# Project Image Inline
# -----------------------------
class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 0
    fields = ("title", "image", "preview_image")
    readonly_fields = ("preview_image",)

    def preview_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width:50px; max-height:50px;" />', obj.image.url)
        return "No Image"
    preview_image.short_description = "Preview"


# -----------------------------
# Project Admin
# -----------------------------
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "created_at", "preview_image")
    list_filter = ("category",)
    search_fields = ("title",)
    inlines = [ProjectImageInline]

    def preview_image(self, obj):
        if obj.main_image:
            return format_html('<img src="{}" style="max-width:50px; max-height:50px;" />', obj.main_image.url)
        return "No Image"
    preview_image.short_description = "Main Image Preview"


# -----------------------------
# Team Member Admin
# -----------------------------
@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "position", "created_at", "preview_image")
    search_fields = ("name", "position")

    def preview_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width:50px; max-height:50px;" />', obj.image.url)
        return "No Image"
    preview_image.short_description = "Preview"


# -----------------------------
# Branch Admin
# -----------------------------
@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "key", "created_at")
    search_fields = ("name", "key")


