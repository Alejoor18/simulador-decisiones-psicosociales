from django.contrib import admin

from .models import ArchivoFuente


@admin.register(ArchivoFuente)
class ArchivoFuenteAdmin(admin.ModelAdmin):
    list_display = ('nombre_original', 'tipo', 'estado', 'docente', 'caso', 'fecha_subida')
    list_filter = ('tipo', 'estado', 'docente')
    search_fields = ('nombre_original',)
    readonly_fields = ('texto_extraido', 'fecha_subida', 'fecha_actualizacion')
