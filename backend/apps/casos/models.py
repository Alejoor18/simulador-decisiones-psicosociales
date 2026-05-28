"""Modelos del dominio Casos de estudio (RF10, RF16-RF24)."""

from django.conf import settings
from django.db import models


class Caso(models.Model):
    """Caso de estudio creado por un docente."""

    class Estado(models.TextChoices):
        BORRADOR = 'BORRADOR', 'Borrador'
        IMPORTADO = 'IMPORTADO', 'Importado'
        GENERADO_IA = 'GENERADO_IA', 'Generado por IA'
        EN_REVISION = 'EN_REVISION', 'En revisión'
        VALIDADO = 'VALIDADO', 'Validado'
        ARCHIVADO = 'ARCHIVADO', 'Archivado'

    nombre = models.CharField('nombre', max_length=200)
    descripcion = models.TextField('descripción breve', blank=True)
    desarrollo_situacional = models.TextField('desarrollo situacional', blank=True)
    contexto_historia = models.TextField('contexto / historia (storytelling)', blank=True)
    area_psicosocial = models.CharField('área de psicología social', max_length=150, blank=True)
    tiempo_estimado_min = models.PositiveIntegerField('tiempo estimado (minutos)', default=30)
    estado = models.CharField('estado', max_length=20, choices=Estado.choices, default=Estado.BORRADOR)

    docente_creador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='docente creador',
        on_delete=models.PROTECT,
        related_name='casos_creados',
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Caso de estudio'
        verbose_name_plural = 'Casos de estudio'
        ordering = ['-fecha_actualizacion']

    def __str__(self) -> str:
        return self.nombre


class Escenario(models.Model):
    """Escenario narrativo dentro de un caso (RF17, RF18)."""

    caso = models.ForeignKey(Caso, on_delete=models.CASCADE, related_name='escenarios')
    orden = models.PositiveIntegerField('orden', default=0)
    titulo = models.CharField('título', max_length=200)
    narrativa = models.TextField('narrativa / storytelling', blank=True)
    recursos_multimedia = models.JSONField(
        'recursos multimedia',
        blank=True,
        default=list,
        help_text='Lista de URLs/refs a imágenes, audios o videos asociados al escenario.',
    )

    class Meta:
        verbose_name = 'Escenario'
        verbose_name_plural = 'Escenarios'
        ordering = ['caso', 'orden']
        constraints = [
            models.UniqueConstraint(fields=['caso', 'orden'], name='unique_orden_por_caso'),
        ]

    def __str__(self) -> str:
        return f'{self.caso.nombre} #{self.orden}: {self.titulo}'


class Pregunta(models.Model):
    """Pregunta dentro de un escenario (RF20)."""

    escenario = models.ForeignKey(Escenario, on_delete=models.CASCADE, related_name='preguntas')
    orden = models.PositiveIntegerField('orden', default=0)
    enunciado = models.TextField('enunciado')
    peso = models.PositiveIntegerField(
        'peso para calificación',
        default=1,
        help_text='Peso relativo en la rúbrica del caso.',
    )

    class Meta:
        verbose_name = 'Pregunta'
        verbose_name_plural = 'Preguntas'
        ordering = ['escenario', 'orden']
        constraints = [
            models.UniqueConstraint(fields=['escenario', 'orden'], name='unique_orden_por_escenario'),
        ]

    def __str__(self) -> str:
        snippet = (self.enunciado[:50] + '…') if len(self.enunciado) > 50 else self.enunciado
        return f'P{self.orden}: {snippet}'


class Respuesta(models.Model):
    """Opción de respuesta a una pregunta (RF21-RF23)."""

    pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE, related_name='respuestas')
    texto = models.TextField('texto de la respuesta')
    es_correcta = models.BooleanField('es correcta', default=False)
    justificacion = models.TextField('justificación', blank=True)
    retroalimentacion = models.TextField('retroalimentación', blank=True)
    orden = models.PositiveIntegerField('orden', default=0)

    class Meta:
        verbose_name = 'Respuesta'
        verbose_name_plural = 'Respuestas'
        ordering = ['pregunta', 'orden']

    def __str__(self) -> str:
        marca = '✓' if self.es_correcta else '✗'
        snippet = (self.texto[:50] + '…') if len(self.texto) > 50 else self.texto
        return f'{marca} {snippet}'


class Rubrica(models.Model):
    """Rúbrica de calificación asociada a un caso (RF24). 1:1 con Caso."""

    caso = models.OneToOneField(Caso, on_delete=models.CASCADE, related_name='rubrica')
    descripcion = models.TextField('descripción', blank=True)
    escala_maxima = models.PositiveIntegerField('puntaje máximo', default=100)
    criterios = models.JSONField(
        'criterios',
        blank=True,
        default=list,
        help_text='Lista de criterios: [{nombre, peso, descripcion}, ...].',
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Rúbrica'
        verbose_name_plural = 'Rúbricas'

    def __str__(self) -> str:
        return f'Rúbrica de {self.caso.nombre}'
