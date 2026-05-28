"""Modelos del dominio Prácticas académicas (RF25-RF29, RF45-RF49)."""

import secrets
import string

from django.conf import settings
from django.db import models

from apps.academico.models import Estudiante
from apps.casos.models import Caso


def generar_codigo_acceso(longitud: int = 8) -> str:
    """Genera un código alfanumérico aleatorio (mayúsculas y dígitos, sin caracteres ambiguos)."""
    alfabeto = ''.join(c for c in string.ascii_uppercase + string.digits if c not in 'O0I1')
    return ''.join(secrets.choice(alfabeto) for _ in range(longitud))


class Practica(models.Model):
    """Práctica académica agendada por un docente sobre un caso."""

    class Estado(models.TextChoices):
        SIN_INICIAR = 'SIN_INICIAR', 'Sin iniciar'
        EN_CURSO = 'EN_CURSO', 'En curso'
        FINALIZADA = 'FINALIZADA', 'Finalizada'
        CANCELADA = 'CANCELADA', 'Cancelada'

    nombre = models.CharField('nombre', max_length=200)
    caso = models.ForeignKey(Caso, on_delete=models.PROTECT, related_name='practicas')
    docente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='practicas',
    )
    fecha_inicio = models.DateTimeField('fecha y hora de inicio')
    fecha_fin = models.DateTimeField('fecha y hora de finalización')
    tiempo_max_min = models.PositiveIntegerField('tiempo máximo de participación (min)', default=30)
    lugar_fisico = models.CharField('lugar físico', max_length=200, blank=True)
    mensaje_personalizado = models.TextField('mensaje a los estudiantes', blank=True)
    estado = models.CharField('estado', max_length=20, choices=Estado.choices, default=Estado.SIN_INICIAR)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Práctica académica'
        verbose_name_plural = 'Prácticas académicas'
        ordering = ['-fecha_inicio']

    def __str__(self) -> str:
        return f'{self.nombre} ({self.caso.nombre})'

    @property
    def ya_finalizada(self) -> bool:
        from django.utils import timezone
        return self.estado == self.Estado.FINALIZADA or timezone.now() > self.fecha_fin


class AutorizacionEstudiante(models.Model):
    """Autorización de un estudiante para participar en una práctica (genera código de acceso)."""

    practica = models.ForeignKey(Practica, on_delete=models.CASCADE, related_name='autorizaciones')
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE, related_name='autorizaciones')
    codigo_acceso = models.CharField('código de acceso', max_length=16, unique=True)
    notificado = models.BooleanField('notificado', default=False)
    reintento_autorizado = models.BooleanField('puede reintentar', default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Autorización de estudiante'
        verbose_name_plural = 'Autorizaciones de estudiantes'
        constraints = [
            models.UniqueConstraint(
                fields=['practica', 'estudiante'],
                name='unique_autorizacion_practica_estudiante',
            ),
        ]
        ordering = ['practica', 'estudiante__last_name']

    def __str__(self) -> str:
        return f'{self.estudiante.correo} → {self.practica.nombre} [{self.codigo_acceso}]'

    def save(self, *args, **kwargs):
        if not self.codigo_acceso:
            self.codigo_acceso = self._generar_codigo_unico()
        super().save(*args, **kwargs)

    @classmethod
    def _generar_codigo_unico(cls) -> str:
        # Hasta 5 intentos para evitar colisiones (probabilidad bajísima con longitud=8).
        for _ in range(5):
            codigo = generar_codigo_acceso()
            if not cls.objects.filter(codigo_acceso=codigo).exists():
                return codigo
        raise RuntimeError('No se pudo generar un código de acceso único.')
