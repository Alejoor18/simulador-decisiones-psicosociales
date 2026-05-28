from rest_framework.routers import DefaultRouter

from .views import ArchivoFuenteViewSet

app_name = 'importacion_documentos'

router = DefaultRouter()
router.register('', ArchivoFuenteViewSet, basename='importacion')

urlpatterns = router.urls
