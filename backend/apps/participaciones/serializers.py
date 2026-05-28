"""Serializers de Participacion y RespuestaSeleccionada."""

from rest_framework import serializers

from apps.casos.serializers import CasoDetalleSerializer

from .models import Participacion, RespuestaSeleccionada


class RespuestaSeleccionadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RespuestaSeleccionada
        fields = ('id', 'participacion', 'pregunta', 'respuesta_elegida', 'timestamp')
        read_only_fields = ('id', 'timestamp')


class ParticipacionSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    practica_nombre = serializers.CharField(source='practica.nombre', read_only=True)
    estudiante_correo = serializers.CharField(source='estudiante.correo', read_only=True)
    estudiante_nombre = serializers.CharField(source='estudiante.nombre_completo', read_only=True)
    respuestas_seleccionadas = RespuestaSeleccionadaSerializer(many=True, read_only=True)

    class Meta:
        model = Participacion
        fields = (
            'id', 'practica', 'practica_nombre', 'estudiante', 'estudiante_correo',
            'estudiante_nombre', 'autorizacion',
            'inicio', 'fin', 'tiempo_usado_seg',
            'estado', 'estado_display',
            'respuestas_seleccionadas',
        )
        read_only_fields = fields


class ParticipacionConCasoSerializer(ParticipacionSerializer):
    """Versión expandida con el caso completo anidado (para que el frontend pinte el simulador)."""

    caso = serializers.SerializerMethodField()

    class Meta(ParticipacionSerializer.Meta):
        fields = ParticipacionSerializer.Meta.fields + ('caso',)

    def get_caso(self, obj: Participacion):
        return CasoDetalleSerializer(obj.practica.caso).data


class ResponderSerializer(serializers.Serializer):
    pregunta_id = serializers.IntegerField(min_value=1)
    respuesta_id = serializers.IntegerField(min_value=1)
