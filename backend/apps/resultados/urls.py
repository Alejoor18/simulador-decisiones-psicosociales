"""Rutas de la app resultados."""

from rest_framework.routers import DefaultRouter

from .views import ResultadoViewSet

app_name = 'resultados'

router = DefaultRouter()
router.register('', ResultadoViewSet, basename='resultados')

urlpatterns = router.urls
