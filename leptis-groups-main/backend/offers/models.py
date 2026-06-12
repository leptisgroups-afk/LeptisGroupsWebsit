from django.db import models
from django.utils.html import format_html
import time

# -----------------------------
# Event Model
# -----------------------------
class Event(models.Model):
    CATEGORY_CHOICES = [
        ("dubai_lassi_home", "DUBAI - LASSI HOME SHOP"),
        ("rak_hamrah", "RAK - LEPTIS SHOPPING CENTER AL HAMRAH"),
        ("rak_marjan", "RAK - LEPTIS SUPERMARKET MARJAN"),
        ("alain_spicy", "AL AIN - SPICY VILLAGE AL AIN"),
        ("alain_leptis", "AL AIN - LEPTIS SHOPPING CENTER AL AIN"),
    ]

    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    expire_date = models.DateTimeField(blank=True, null=True, db_index=True)  # Expiration date and time for events
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# -----------------------------
# Event PDF Model
# -----------------------------
class EventPDF(models.Model):
    event = models.ForeignKey(
        Event, related_name="pdfs", on_delete=models.CASCADE
    )
    pdf_file = models.FileField(upload_to="events/pdfs/")  # PDF file
    thumbnail = models.ImageField(upload_to="events/thumbnails/", blank=True, null=True)  # optional preview
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PDF for {self.event.title}"

    def preview_pdf(self):
        """
        Optional HTML preview for Django admin
        """
        if self.thumbnail:
            return format_html(
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-width:120px; max-height:120px;" />'
                '</a>',
                self.pdf_file.url, self.thumbnail.url
            )
        return format_html(
            '<a href="{}" target="_blank">View PDF</a>',
            self.pdf_file.url
        )
    preview_pdf.short_description = "PDF Preview"


# -----------------------------
# Career Application Model
# -----------------------------
def cv_upload_path(instance, filename):
    """
    Store CVs in media/cvs/<timestamp>_<filename>
    """
    return f"cvs/{int(time.time())}_{filename}"


class CareerApplication(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50)
    email = models.EmailField()
    message = models.TextField(blank=True)
    cv = models.FileField(upload_to=cv_upload_path)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.email}"


# -----------------------------
# Site Settings Model (Singleton)
# -----------------------------
class SiteSettings(models.Model):
    # Company Stats
    company_name = models.CharField(max_length=200, default="Leptis Group")
    established_year = models.CharField(max_length=10, default="2016")
    employee_count = models.CharField(max_length=50, default="100+")
    verticals_count = models.CharField(max_length=50, default="4+")

    # About Page
    about_title = models.CharField(max_length=255, default="Delivering Quality, Trust, and Modern Convenience")
    about_narrative_1 = models.TextField(
        default="Founded in 2016 in the United Arab Emirates, Leptis Group originated as a strategic expansion of Abreco Freight's logistics and trading operations. Since our inception, we have systematically diversified across sectors including international trading, exports, fresh agricultural produce supply, and modern retail supermarkets."
    )
    about_narrative_2 = models.TextField(
        default="Today, with extensive operations in the UAE and India, we are recognized for our unwavering reliability, global connectivity, and strict adherence to international quality standards. We believe every consumer deserves accessible, high-quality, and modern experiences, which we strive to deliver every day."
    )

    # Careers Page
    careers_title = models.CharField(max_length=255, default="Careers at Leptis")
    careers_description = models.TextField(
        default="Join our growing team of dedicated professionals and build a rewarding career at Leptis Group."
    )
    careers_email_recipient = models.EmailField(default="leptisgroupsit@gmail.com")

    # Contact Info
    contact_email = models.EmailField(default="info@leptisgroups.com")
    contact_phone = models.CharField(max_length=50, default="+971 4 250 5549")
    contact_address = models.TextField(default="Al Jazeera Al Hamra, Ras Al Khaimah, UAE")

    # Homepage Hero Settings
    hero_title = models.CharField(
        max_length=255, 
        default="Advancing Growth Through Innovative & Trusted Solutions"
    )
    hero_description = models.TextField(
        default="Take your operations to the next level with Leptis Group's global expertise spanning Logistics, International Trading, Retail Supermarkets, and Fresh Agricultural Sourcing."
    )
    hero_btn1_text = models.CharField(max_length=100, default="Partner With Us")
    hero_btn2_text = models.CharField(max_length=100, default="Discover More")

    # Footer Settings
    footer_about_text = models.TextField(
        default="Leptis Group, founded in 2016 in the UAE, has evolved into a multi-sector enterprise covering logistics, trading, exports, and retail. Our commitment to quality and customer satisfaction defines everything we do."
    )
    facebook_url = models.CharField(
        max_length=500, 
        default="https://www.facebook.com/share/19u51ph8vv/"
    )
    instagram_url = models.CharField(max_length=500, default="#")
    linkedin_url = models.CharField(max_length=500, default="#")
    twitter_url = models.CharField(max_length=500, default="#")
    copyright_text = models.CharField(
        max_length=255, 
        default="Leptis Group. All rights reserved."
    )

    # Editable page images
    hero_bg = models.ImageField(upload_to="settings/", blank=True, null=True)
    about_team_img = models.ImageField(upload_to="settings/", blank=True, null=True)
    home_about_img = models.ImageField(upload_to="settings/", blank=True, null=True)
    consult_img = models.ImageField(upload_to="settings/", blank=True, null=True)
    careers_bg = models.ImageField(upload_to="settings/", blank=True, null=True)

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return "Global Site Settings"


# -----------------------------
# Contact Message Model
# -----------------------------
class ContactMessage(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.subject or 'No subject'}"


# -----------------------------
# Brand Logo Model
# -----------------------------
class BrandLogo(models.Model):
    name = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to="brands/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or f"Brand Logo {self.id}"


# -----------------------------
# Project Model
# -----------------------------
class Project(models.Model):
    CATEGORY_CHOICES = [
        ("dubai_lassi_home", "DUBAI - LASSI HOME SHOP"),
        ("rak_hamrah", "RAK - LEPTIS SHOPPING CENTER AL HAMRAH"),
        ("rak_marjan", "RAK - LEPTIS SUPERMARKET MARJAN"),
        ("alain_spicy", "AL AIN - SPICY VILLAGE AL AIN"),
        ("alain_leptis", "AL AIN - LEPTIS SHOPPING CENTER AL AIN"),
    ]

    title = models.CharField(max_length=255)
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        default="dubai_lassi_home"
    )
    main_image = models.ImageField(upload_to="projects/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# -----------------------------
# Project Sub-Image (Gallery) Model
# -----------------------------
class ProjectImage(models.Model):
    project = models.ForeignKey(Project, related_name="images", on_delete=models.CASCADE)
    title = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="projects/gallery/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Gallery image for {self.project.title} - {self.title or self.id}"


# -----------------------------
# Team Member Model
# -----------------------------
class TeamMember(models.Model):
    name = models.CharField(max_length=255, blank=True)
    position = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="team/")
    facebook_url = models.CharField(max_length=500, blank=True, default="#")
    twitter_url = models.CharField(max_length=500, blank=True, default="#")
    youtube_url = models.CharField(max_length=500, blank=True, default="#")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# -----------------------------
# Signals for file cleanup
# -----------------------------
from django.db.models.signals import post_delete
from django.dispatch import receiver
import os

@receiver(post_delete, sender=EventPDF)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes PDF and thumbnail files from disk when corresponding
    EventPDF object is deleted.
    """
    if instance.pdf_file:
        if os.path.isfile(instance.pdf_file.path):
            try:
                os.remove(instance.pdf_file.path)
            except Exception as e:
                print(f"Error deleting PDF file {instance.pdf_file.path}: {e}")
    if instance.thumbnail:
        if os.path.isfile(instance.thumbnail.path):
            try:
                os.remove(instance.thumbnail.path)
            except Exception as e:
                print(f"Error deleting thumbnail file {instance.thumbnail.path}: {e}")






