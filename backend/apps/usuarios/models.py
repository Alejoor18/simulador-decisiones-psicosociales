from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    """
    Usuario base de la plataforma.

    Hereda de AbstractUser (username, password, first_name, last_name, email,
    is_staff, is_active, is_superuser, date_joined) y agrega el campo `rol`
    para diferenciar Administrador, Docente y Estudiante.

    AUTH_USER_MODEL en settings.py debe apuntar a 'usuarios.Usuario'.
    """

    class Rol(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        DOCENTE = 'DOCENTE', 'Docente'
        ESTUDIANTE = 'ESTUDIANTE', 'Estudiante'

    email = models.EmailField('correo electrónico', unique=True)
    rol = models.CharField(
        'rol',
        max_length=20,
        choices=Rol.choices,
        default=Rol.DOCENTE,
    )

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-date_joined']

    def __str__(self) -> str:
        return f'{self.get_full_name() or self.username} ({self.get_rol_display()})'

    @property
    def es_admin(self) -> bool:
        return self.rol == self.Rol.ADMIN

    @property
    def es_docente(self) -> bool:
        return self.rol == self.Rol.DOCENTE

    @property
    def es_estudiante(self) -> bool:
        return self.rol == self.Rol.ESTUDIANTE
