"""Serializers de casos, escenarios, preguntas, respuestas y rúbricas."""

from rest_framework import serializers

from .models import Caso, Escenario, Pregunta, Respuesta, Rubrica


class RespuestaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Respuesta
        fields = ('id', 'pregunta', 'orden', 'texto', 'es_correcta', 'justificacion', 'retroalimentacion')
        read_only_fields = ('id',)


class PreguntaSerializer(serializers.ModelSerializer):
    respuestas = RespuestaSerializer(many=True, read_only=True)

    class Meta:
        model = Pregunta
        fields = ('id', 'escenario', 'orden', 'enunciado', 'peso', 'respuestas')
        read_only_fields = ('id', 'respuestas')


class EscenarioSerializer(serializers.ModelSerializer):
    preguntas = PreguntaSerializer(many=True, read_only=True)

    class Meta:
        model = Escenario
        fields = ('id', 'caso', 'orden', 'titulo', 'narrativa', 'recursos_multimedia', 'preguntas')
        read_only_fields = ('id', 'preguntas')


class RubricaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubrica
        fields = ('id', 'caso', 'descripcion', 'escala_maxima', 'criterios', 'fecha_creacion', 'fecha_actualizacion')
        read_only_fields = ('id', 'fecha_creacion', 'fecha_actualizacion')


class CasoListSerializer(serializers.ModelSerializer):
    docente_creador_username = serializers.CharField(source='docente_creador.username', read_only=True)
    escenarios_count = serializers.SerializerMethodField()
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Caso
        fields = (
            'id', 'nombre', 'descripcion', 'area_psicosocial',
            'tiempo_estimado_min', 'estado', 'estado_display',
            'docente_creador', 'docente_creador_username',
            'escenarios_count', 'fecha_creacion', 'fecha_actualizacion',
        )
        read_only_fields = (
            'id', 'docente_creador', 'docente_creador_username',
            'escenarios_count', 'estado_display',
            'fecha_creacion', 'fecha_actualizacion',
        )

    def get_escenarios_count(self, obj: Caso) -> int:
        return obj.escenarios.count()


class CasoDetalleSerializer(CasoListSerializer):
    escenarios = EscenarioSerializer(many=True, read_only=True)
    rubrica = RubricaSerializer(read_only=True)

    class Meta(CasoListSerializer.Meta):
        fields = CasoListSerializer.Meta.fields + (
            'desarrollo_situacional', 'contexto_historia',
            'escenarios', 'rubrica',
        )
