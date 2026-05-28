"""Permissions reutilizables a nivel de proyecto."""

from rest_framework.permissions import BasePermission, IsAuthenticated

from .models import Usuario


class EsDocente(BasePermission):
    """Solo permite acceso a usuarios autenticados con rol DOCENTE."""

    message = 'Esta acción requiere rol DOCENTE.'

    def has_permission(self, request, view) -> bool:
        return (
            request.user
            and request.user.is_authenticated
            and request.user.rol == Usuario.Rol.DOCENTE
        )


class EsAdmin(BasePermission):
    """Solo permite acceso a usuarios con rol ADMIN."""

    message = 'Esta acción requiere rol ADMIN.'

    def has_permission(self, request, view) -> bool:
        return (
            request.user
            and request.user.is_authenticated
            and request.user.rol == Usuario.Rol.ADMIN
        )


class EsDocenteOAdmin(IsAuthenticated):
    """Acceso para docentes o administradores autenticados."""

    message = 'Esta acción requiere rol DOCENTE o ADMIN.'

    def has_permission(self, request, view) -> bool:
        if not super().has_permission(request, view):
            return False
        return request.user.rol in (Usuario.Rol.DOCENTE, Usuario.Rol.ADMIN)
