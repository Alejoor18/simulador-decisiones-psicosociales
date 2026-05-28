"""
URLs raíz del proyecto.

Convenciones:
- Todo bajo `/api/` es API REST consumida por el frontend Angular.
- `/admin/` es el admin de Django (uso interno del administrador técnico).
- Endpoints JWT bajo `/api/auth/token*` siguen la convención de SimpleJWT.
- Cada app expone su propio `urls.py` y se incluye con un prefijo coherente.
- Archivos media servidos en desarrollo (DEBUG=True); en producción los sirve el servidor web.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from apps.usuarios.views import CustomTokenObtainPairView
from .views import health

urlpatterns = [
    # ---------- Admin de Django ----------
    path('admin/', admin.site.urls),

    # ---------- Healthcheck público ----------
    path('api/health/', health, name='health'),

    # ---------- Autenticación JWT (vistas públicas, AllowAny por defecto) ----------
    path('api/auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # ---------- Apps de dominio ----------
    # Cada app expone sus endpoints específicos. Por ahora están vacíos pero registrados.
    path('api/auth/', include('apps.usuarios.urls')),
    path('api/', include('apps.academico.urls')),
    path('api/casos/', include('apps.casos.urls')),
    path('api/ia/', include('apps.ia_generativa.urls')),
    path('api/importacion/', include('apps.importacion_documentos.urls')),
    path('api/practicas/', include('apps.practicas.urls')),
    path('api/participaciones/', include('apps.participaciones.urls')),
    path('api/resultados/', include('apps.resultados.urls')),
    path('api/reportes/', include('apps.reportes.urls')),
]

# ---------- Archivos media en desarrollo ----------
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
