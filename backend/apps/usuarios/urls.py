"""Rutas de la app usuarios."""

from django.urls import path

from .views import LogoutView, PerfilView, RegistroDocenteView

app_name = 'usuarios'

urlpatterns = [
    path('registro-docente/', RegistroDocenteView.as_view(), name='registro_docente'),
    path('perfil/', PerfilView.as_view(), name='perfil'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
