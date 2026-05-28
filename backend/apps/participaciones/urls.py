"""Rutas de la app participaciones."""

from rest_framework.routers import DefaultRouter

from .views import ParticipacionViewSet

app_name = 'participaciones'

router = DefaultRouter()
router.register('', ParticipacionViewSet, basename='participaciones')

urlpatterns = router.urls
