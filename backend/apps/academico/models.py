"""
Modelos de la app academico.

Diseño:
- Un Estudiante existe en el sistema identificado por su correo (único global).
- Un Estudiante puede ser administrado por múltiples docentes (M:N `docentes`).
  Esto soporta el caso RN05/RN07: un docente puede vincular un estudiante que
  ya existe en el sistema (creado por otro docente) usando su correo.
- `docente_creador` se conserva para auditoría (quién lo dio de alta primero).
- Cada Grupo pertenece a un único docente (no se comparten entre docentes).
- Un Estudiante puede pertenecer a múltiples grupos del mismo docente.
"""

from django.conf import settings
from django.db import models


class Estudiante(models.Model):
    """Estudiante del sistema, identificado globalmente por su correo."""

    correo = models.EmailField('correo electrónico', unique=True)
    first_name = models.CharField('nombre', max_length=150)
    last_name = models.CharField('apellido', max_length=150)

    # Vínculo opcional con una cuenta Usuario (se llena si más adelante el
    # estudiante crea una cuenta tradicional). Por ahora la mayoría de
    # estudiantes accederán solo con correo + código (sin Usuario).
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        verbose_name='cuenta de usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='perfil_estudiante',
    )

    # Docente que lo dio de alta inicialmente (auditoría).
    docente_creador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='docente creador',
        on_delete=models.PROTECT,
        related_name='estudiantes_creados',
    )

    # Docentes que actualmente administran este estudiante (puede ser más de uno).
    docentes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        verbose_name='docentes que lo administran',
        related_name='estudiantes',
        blank=True,
    )

    activo = models.BooleanField('activo', default=True)
    fecha_creacion = models.DateTimeField('fecha de creación', auto_now_add=True)
    fecha_actualizacion = models.DateTimeField('última actualización', auto_now=True)

    class Meta:
        verbose_name = 'Estudiante'
        verbose_name_plural = 'Estudiantes'
        ordering = ['last_name', 'first_name']
        indexes = [
            models.Index(fields=['correo']),
        ]

    def __str__(self) -> str:
        return f'{self.nombre_completo} <{self.correo}>'

    @property
    def nombre_completo(self) -> str:
        return f'{self.first_name} {self.last_name}'.strip() or self.correo


class Grupo(models.Model):
    """Grupo académico creado por un docente. Contiene estudiantes vía InscripcionGrupo."""

    nombre = models.CharField('nombre', max_length=150)
    descripcion = models.TextField('descripción', blank=True)

    docente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='docente',
        on_delete=models.CASCADE,
        related_name='grupos',
    )

    estudiantes = models.ManyToManyField(
        Estudiante,
        verbose_name='estudiantes',
        through='InscripcionGrupo',
        related_name='grupos',
        blank=True,
    )

    fecha_creacion = models.DateTimeField('fecha de creación', auto_now_add=True)
    fecha_actualizacion = models.DateTimeField('última actualización', auto_now=True)

    class Meta:
        verbose_name = 'Grupo'
        verbose_name_plural = 'Grupos'
        ordering = ['-fecha_creacion']
        constraints = [
            # Cada docente no puede tener dos grupos con el mismo nombre.
            models.UniqueConstraint(fields=['docente', 'nombre'], name='unique_grupo_nombre_por_docente'),
        ]

    def __str__(self) -> str:
        return self.nombre


class InscripcionGrupo(models.Model):
    """Tabla intermedia M:N entre Grupo y Estudiante (permite metadatos extra)."""

    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE, related_name='inscripciones')
    estudiante = models.ForeignKey(
        Estudiante,
        on_delete=models.CASCADE,
        related_name='inscripciones',
    )
    fecha_inscripcion = models.DateTimeField('fecha de inscripción', auto_now_add=True)

    class Meta:
        verbose_name = 'Inscripción a grupo'
        verbose_name_plural = 'Inscripciones a grupos'
        constraints = [
            models.UniqueConstraint(
                fields=['grupo', 'estudiante'],
                name='unique_inscripcion_grupo_estudiante',
            ),
        ]

    def __str__(self) -> str:
        return f'{self.estudiante.correo} en {self.grupo.nombre}'
