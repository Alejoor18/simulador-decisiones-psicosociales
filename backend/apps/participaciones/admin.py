from django.contrib import admin

from .models import Participacion, RespuestaSeleccionada


class RespuestaSeleccionadaInline(admin.TabularInline):
    model = RespuestaSeleccionada
    extra = 0
    readonly_fields = ('timestamp',)


@admin.register(Participacion)
class ParticipacionAdmin(admin.ModelAdmin):
    list_display = ('practica', 'estudiante', 'estado', 'inicio', 'fin', 'tiempo_usado_seg')
    list_filter = ('estado', 'practica')
    search_fields = ('estudiante__correo', 'practica__nombre')
    inlines = [RespuestaSeleccionadaInline]
