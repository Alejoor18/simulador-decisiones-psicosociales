"""Rutas de la app casos."""

from rest_framework.routers import DefaultRouter

from .views import (
    CasoViewSet,
    EscenarioViewSet,
    PreguntaViewSet,
    RespuestaViewSet,
    RubricaViewSet,
)

app_name = 'casos'

router = DefaultRouter()
router.register('casos', CasoViewSet, basename='casos')
router.register('escenarios', EscenarioViewSet, basename='escenarios')
router.register('preguntas', PreguntaViewSet, basename='preguntas')
router.register('respuestas', RespuestaViewSet, basename='respuestas')
router.register('rubricas', RubricaViewSet, basename='rubricas')

urlpatterns = router.urls
