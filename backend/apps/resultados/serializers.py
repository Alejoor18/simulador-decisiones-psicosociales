"""Serializers de Resultado."""

from rest_framework import serializers

from apps.casos.models import Pregunta
from apps.casos.serializers import RespuestaSerializer

from .models import Resultado


class DetalleRespuestaUsuarioSerializer(serializers.Serializer):
    """Para el resumen pregunta-por-pregunta del estudiante (RF38, RN20)."""

    pregunta_id = serializers.IntegerField()
    enunciado = serializers.CharField()
    peso = serializers.IntegerField()
    respondida = serializers.BooleanField()
    respuesta_elegida = RespuestaSerializer(allow_null=True)
    respuestas_correctas = RespuestaSerializer(many=True)


class ResultadoSerializer(serializers.ModelSerializer):
    estudiante_correo = serializers.CharField(source='participacion.estudiante.correo', read_only=True)
    estudiante_nombre = serializers.CharField(source='participacion.estudiante.nombre_completo', read_only=True)
    practica_id = serializers.IntegerField(source='participacion.practica_id', read_only=True)
    practica_nombre = serializers.CharField(source='participacion.practica.nombre', read_only=True)
    caso_nombre = serializers.CharField(source='participacion.practica.caso.nombre', read_only=True)
    detalle_preguntas = serializers.SerializerMethodField()

    class Meta:
        model = Resultado
        fields = (
            'id', 'participacion',
            'estudiante_correo', 'estudiante_nombre',
            'practica_id', 'practica_nombre', 'caso_nombre',
            'correctas', 'incorrectas', 'no_respondidas',
            'peso_obtenido', 'peso_total', 'nota_final',
            'feedback_docente', 'notificado_estudiante',
            'fecha_calculo', 'fecha_actualizacion',
            'detalle_preguntas',
        )
        read_only_fields = (
            'id', 'participacion',
            'estudiante_correo', 'estudiante_nombre',
            'practica_id', 'practica_nombre', 'caso_nombre',
            'correctas', 'incorrectas', 'no_respondidas',
            'peso_obtenido', 'peso_total', 'nota_final',
            'fecha_calculo', 'fecha_actualizacion',
            'detalle_preguntas', 'notificado_estudiante',
        )

    def get_detalle_preguntas(self, obj: Resultado):
        seleccionadas = {
            rs.pregunta_id: rs.respuesta_elegida
            for rs in obj.participacion.respuestas_seleccionadas.select_related('respuesta_elegida')
        }
        preguntas = Pregunta.objects.filter(
            escenario__caso=obj.participacion.practica.caso,
        ).prefetch_related('respuestas').order_by('escenario__orden', 'orden')

        out = []
        for p in preguntas:
            sel = seleccionadas.get(p.id)
            out.append({
                'pregunta_id': p.id,
                'enunciado': p.enunciado,
                'peso': p.peso,
                'respondida': sel is not None,
                'respuesta_elegida': RespuestaSerializer(sel).data if sel else None,
                'respuestas_correctas': RespuestaSerializer(
                    [r for r in p.respuestas.all() if r.es_correcta], many=True,
                ).data,
            })
        return out


class FeedbackDocenteSerializer(serializers.Serializer):
    feedback_docente = serializers.CharField()
