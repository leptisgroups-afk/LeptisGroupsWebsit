"""
Django settings for backend project.
"""

import os
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


def get_env_var(name, default=None, required=False):
    value = os.environ.get(name, default)
    if required and not value:
        raise ImproperlyConfigured(f"The environment variable {name} is required.")
    return value

SECRET_KEY = get_env_var('DJANGO_SECRET_KEY', 'django-insecure-fallback-key-for-dev')
DEBUG = get_env_var('DJANGO_DEBUG', '1') == '1'

ALLOWED_HOSTS = [host.strip() for host in get_env_var('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if host.strip()]

# -------------------
#  CORS SETTINGS
# -------------------
CORS_ALLOW_ALL_ORIGINS = get_env_var('CORS_ALLOW_ALL_ORIGINS', '0') == '1'

CORS_ALLOW_CREDENTIALS = get_env_var('CORS_ALLOW_CREDENTIALS', '1') == '1'
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in get_env_var('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',') if origin.strip()]


# -------------------
#  IFRAME + SECURITY FIXES
# -------------------

# Allow iframe loading from React
X_FRAME_OPTIONS = "SAMEORIGIN"

# Allow React domain to load your PDFs inside iframe
# Without this, Chrome blocks it even if X_FRAME_OPTIONS is correct
CSP_FRAME_ANCESTORS = (
    "'self'",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://16.171.11.162:3000",
    "https://leptisgroups.com",
    "https://www.leptisgroups.com"
)

# If CSP middleware is used, Django needs this:
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin-allow-popups"


# -------------------
#  APPS
# -------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',

    # Local apps
    'offers',
]

# -------------------
# MIDDLEWARE
# -------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # MUST BE FIRST
    'offers.middleware.FirewallMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',

    # Must come AFTER CommonMiddleware
    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',

    # Important — allows iframe
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# -------------------
# DATABASE
# -------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# -------------------
# AUTH
# -------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# -------------------
# INTERNATIONALIZATION
# -------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# -------------------
# STATIC / MEDIA
# -------------------
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# -------------------
# DRF
# -------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# -------------------
# EMAIL SETTINGS
# -------------------
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = get_env_var('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(get_env_var('EMAIL_PORT', '587'))
EMAIL_USE_TLS = get_env_var('EMAIL_USE_TLS', '1') == '1'
EMAIL_HOST_USER = get_env_var('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = get_env_var('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = get_env_var('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)
