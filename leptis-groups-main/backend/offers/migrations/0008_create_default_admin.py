from django.db import migrations
from django.contrib.auth import get_user_model

def create_default_admin(apps, schema_editor):
    User = get_user_model()
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='leptisgroupsit@gmail.com',
            password='leptis2026'
        )

def remove_default_admin(apps, schema_editor):
    User = get_user_model()
    User.objects.filter(username='admin').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('offers', '0007_alter_offer_expire_date'),
    ]

    operations = [
        migrations.RunPython(create_default_admin, reverse_code=remove_default_admin),
    ]
