"""Modelo ArchivoFuente para casos importados desde PDF/DOCX/TXT."""

from django.conf import settings
from django.db import models


class ArchivoFuente(models.Model):
    class Estado(models.TextChoices):
        SUBIDO = 'SUBIDO', 'Subido'
        PROCESADO = 'PROCESADO', 'Procesado'
        CONVERTIDO_A_CASO = 'CONVERTIDO_A_CASO', 'Convertido a caso'
        RECHAZADO = 'RECHAZADO', 'Rechazado'

    class Tipo(models.TextChoices):
        PDF = 'PDF', 'PDF'
        DOCX = 'DOCX', 'DOCX'
        TXT = 'TXT', 'TXT'

    archivo = models.FileField('archivo', upload_to='importaciones/%Y/%m/')
    nombre_original = models.CharField('nombre original', max_length=255)
    tipo = models.CharField('tipo', max_length=8, choices=Tipo.choices)
    texto_extraido = models.TextField('texto extraído', blank=True)
    estado = models.CharField('estado', max_length=24, choices=Estado.choices, default=Estado.SUBIDO)
    docente = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='archivos_importados',
    )
    caso = models.ForeignKey(
        'casos.Caso', on_delete=models.SET_NULL, null=True, blank=True, related_name='archivos_fuente',
    )
    fecha_subida = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Archivo fuente'
        verbose_name_plural = 'Archivos fuente'
        ordering = ['-fecha_subida']

    def __str__(self) -> str:
        return f'{self.nombre_original} ({self.tipo})'
