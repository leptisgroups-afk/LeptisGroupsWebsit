from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CareerApplicationViewSet,
    ContactMessageViewSet,
    BranchViewSet,
    EventViewSet,
    SiteSettingsViewSet,
    BrandLogoViewSet,
    ProjectViewSet,
    ProjectImageViewSet,
    TeamMemberViewSet,
    BlockedIPViewSet,
    health_check
)

# Create a router and register our ViewSets
router = DefaultRouter()
router.register(r'career-applications', CareerApplicationViewSet, basename='careerapplication')
router.register(r'contact-messages', ContactMessageViewSet, basename='contactmessage')
router.register(r'branches', BranchViewSet, basename='branches')
router.register(r'events', EventViewSet, basename='events')  
router.register(r'site-settings', SiteSettingsViewSet, basename='sitesettings')
router.register(r'brand-logos', BrandLogoViewSet, basename='brandlogos')
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'project-images', ProjectImageViewSet, basename='projectimages')
router.register(r'team-members', TeamMemberViewSet, basename='teammembers')
router.register(r'blocked-ips', BlockedIPViewSet, basename='blockedips')



urlpatterns = [
    # Include health check endpoint
    path('api/check/', health_check, name='health_check'),
    # Include all API endpoints from the router
    path('api/', include(router.urls)),
]

