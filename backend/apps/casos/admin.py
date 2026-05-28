from django.contrib import admin

from .models import Caso, Escenario, Pregunta, Respuesta, Rubrica


class RespuestaInline(admin.TabularInline):
    model = Respuesta
    extra = 0


class PreguntaInline(admin.TabularInline):
    model = Pregunta
    extra = 0


class EscenarioInline(admin.StackedInline):
    model = Escenario
    extra = 0


@admin.register(Caso)
class CasoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'area_psicosocial', 'estado', 'docente_creador', 'fecha_actualizacion')
    list_filter = ('estado', 'area_psicosocial', 'docente_creador')
    search_fields = ('nombre', 'descripcion', 'contexto_historia')
    inlines = [EscenarioInline]


@admin.register(Escenario)
class EscenarioAdmin(admin.ModelAdmin):
    list_display = ('caso', 'orden', 'titulo')
    list_filter = ('caso',)
    search_fields = ('titulo', 'narrativa')
    inlines = [PreguntaInline]


@admin.register(Pregunta)
class PreguntaAdmin(admin.ModelAdmin):
    list_display = ('escenario', 'orden', 'enunciado', 'peso')
    list_filter = ('escenario__caso',)
    inlines = [RespuestaInline]


@admin.register(Respuesta)
class RespuestaAdmin(admin.ModelAdmin):
    list_display = ('pregunta', 'orden', 'texto', 'es_correcta')
    list_filter = ('es_correcta',)


@admin.register(Rubrica)
class RubricaAdmin(admin.ModelAdmin):
    list_display = ('caso', 'escala_maxima', 'fecha_actualizacion')
