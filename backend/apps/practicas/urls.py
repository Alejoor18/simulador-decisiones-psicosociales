"""Rutas de la app practicas."""

from rest_framework.routers import DefaultRouter

from .views import PracticaViewSet

app_name = 'practicas'

router = DefaultRouter()
router.register('', PracticaViewSet, basename='practicas')

urlpatterns = router.urls
