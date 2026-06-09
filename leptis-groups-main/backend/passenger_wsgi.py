import os
import sys

# Add the application directory to the python path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variable for Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'

# Load the WSGI application for Passenger
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
