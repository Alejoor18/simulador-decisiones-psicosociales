"""Serializers de la app practicas."""

from rest_framework import serializers

from apps.academico.models import Estudiante

from .models import AutorizacionEstudiante, Practica


class AutorizacionSerializer(serializers.ModelSerializer):
    estudiante_correo = serializers.CharField(source='estudiante.correo', read_only=True)
    estudiante_nombre = serializers.CharField(source='estudiante.nombre_completo', read_only=True)

    class Meta:
        model = AutorizacionEstudiante
        fields = (
            'id', 'practica', 'estudiante', 'estudiante_correo', 'estudiante_nombre',
            'codigo_acceso', 'notificado', 'reintento_autorizado', 'fecha_creacion',
        )
        read_only_fields = ('id', 'codigo_acceso', 'fecha_creacion')


class PracticaListSerializer(serializers.ModelSerializer):
    caso_nombre = serializers.CharField(source='caso.nombre', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    autorizaciones_count = serializers.SerializerMethodField()

    class Meta:
        model = Practica
        fields = (
            'id', 'nombre', 'caso', 'caso_nombre', 'docente',
            'fecha_inicio', 'fecha_fin', 'tiempo_max_min',
            'lugar_fisico', 'mensaje_personalizado',
            'estado', 'estado_display', 'autorizaciones_count',
            'fecha_creacion', 'fecha_actualizacion',
        )
        read_only_fields = (
            'id', 'docente', 'caso_nombre', 'estado_display',
            'autorizaciones_count', 'fecha_creacion', 'fecha_actualizacion',
        )

    def get_autorizaciones_count(self, obj: Practica) -> int:
        return obj.autorizaciones.count()


class PracticaDetalleSerializer(PracticaListSerializer):
    autorizaciones = AutorizacionSerializer(many=True, read_only=True)

    class Meta(PracticaListSerializer.Meta):
        fields = PracticaListSerializer.Meta.fields + ('autorizaciones',)


class AutorizarEstudiantesSerializer(serializers.Serializer):
    """Para autorizar varios estudiantes/grupos a la vez sobre una práctica."""

    estudiante_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), required=False, default=list,
    )
    grupo_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), required=False, default=list,
    )


class AccesoEstudianteSerializer(serializers.Serializer):
    """Para el endpoint público /api/auth/estudiante-acceso/."""

    correo = serializers.EmailField()
    codigo = serializers.CharField(max_length=16)

    def validate(self, attrs):
        correo = attrs['correo'].lower().strip()
        codigo = attrs['codigo'].upper().strip()
        try:
            est = Estudiante.objects.get(correo=correo)
        except Estudiante.DoesNotExist:
            raise serializers.ValidationError('Correo no registrado en el sistema.')
        try:
            auth = AutorizacionEstudiante.objects.select_related('practica').get(
                estudiante=est, codigo_acceso=codigo,
            )
        except AutorizacionEstudiante.DoesNotExist:
            raise serializers.ValidationError('Código de acceso inválido para este correo.')
        attrs['estudiante'] = est
        attrs['autorizacion'] = auth
        return attrs
