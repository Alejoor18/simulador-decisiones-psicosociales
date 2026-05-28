from django.contrib import admin

from .models import Resultado


@admin.register(Resultado)
class ResultadoAdmin(admin.ModelAdmin):
    list_display = ('participacion', 'nota_final', 'correctas', 'incorrectas', 'no_respondidas', 'notificado_estudiante')
    list_filter = ('notificado_estudiante',)
    search_fields = ('participacion__estudiante__correo', 'participacion__practica__nombre')
    readonly_fields = (
        'participacion', 'correctas', 'incorrectas', 'no_respondidas',
        'peso_obtenido', 'peso_total', 'nota_final', 'fecha_calculo', 'fecha_actualizacion',
    )
