from django.contrib import admin

from .models import AutorizacionEstudiante, Practica


class AutorizacionInline(admin.TabularInline):
    model = AutorizacionEstudiante
    extra = 0
    readonly_fields = ('codigo_acceso', 'fecha_creacion')


@admin.register(Practica)
class PracticaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'caso', 'docente', 'fecha_inicio', 'fecha_fin', 'estado')
    list_filter = ('estado', 'docente', 'caso')
    search_fields = ('nombre',)
    inlines = [AutorizacionInline]


@admin.register(AutorizacionEstudiante)
class AutorizacionAdmin(admin.ModelAdmin):
    list_display = ('practica', 'estudiante', 'codigo_acceso', 'notificado', 'reintento_autorizado')
    list_filter = ('notificado', 'reintento_autorizado', 'practica')
    search_fields = ('codigo_acceso', 'estudiante__correo')
    readonly_fields = ('codigo_acceso', 'fecha_creacion')
