"""Serializers para Estudiante, Grupo e InscripcionGrupo."""

from rest_framework import serializers

from .models import Estudiante, Grupo, InscripcionGrupo


class EstudianteSerializer(serializers.ModelSerializer):
    """Serializer de lectura/escritura para Estudiante."""

    nombre_completo = serializers.ReadOnlyField()
    docente_creador_username = serializers.CharField(
        source='docente_creador.username',
        read_only=True,
    )

    class Meta:
        model = Estudiante
        fields = (
            'id',
            'correo',
            'first_name',
            'last_name',
            'nombre_completo',
            'activo',
            'docente_creador',
            'docente_creador_username',
            'fecha_creacion',
            'fecha_actualizacion',
        )
        read_only_fields = (
            'id',
            'docente_creador',
            'docente_creador_username',
            'fecha_creacion',
            'fecha_actualizacion',
        )

    def validate_correo(self, value: str) -> str:
        return value.lower().strip()


class AgregarEstudiantePorCorreoSerializer(serializers.Serializer):
    """
    Crea o vincula un estudiante usando su correo electrónico (RF06, RF07).

    Comportamiento:
    - Si el correo ya existe en el sistema: lo vincula al docente actual
      (idempotente, no duplica).
    - Si no existe: lo crea con `first_name`/`last_name` si vienen, y lo
      vincula al docente actual como creador.
    """

    correo = serializers.EmailField(required=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')

    def validate_correo(self, value: str) -> str:
        return value.lower().strip()


class GrupoSerializer(serializers.ModelSerializer):
    """Serializer básico de Grupo (sin lista expandida de estudiantes)."""

    estudiantes_count = serializers.SerializerMethodField()

    class Meta:
        model = Grupo
        fields = (
            'id',
            'nombre',
            'descripcion',
            'docente',
            'estudiantes_count',
            'fecha_creacion',
            'fecha_actualizacion',
        )
        read_only_fields = (
            'id',
            'docente',
            'estudiantes_count',
            'fecha_creacion',
            'fecha_actualizacion',
        )

    def get_estudiantes_count(self, obj: Grupo) -> int:
        return obj.estudiantes.count()


class GrupoDetalleSerializer(GrupoSerializer):
    """Grupo con la lista expandida de estudiantes (para vista de detalle)."""

    estudiantes = EstudianteSerializer(many=True, read_only=True)

    class Meta(GrupoSerializer.Meta):
        fields = GrupoSerializer.Meta.fields + ('estudiantes',)


class GrupoEstudiantesSerializer(serializers.Serializer):
    """Para añadir o remover estudiantes de un grupo en lote."""

    estudiante_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )


class InscripcionGrupoSerializer(serializers.ModelSerializer):
    estudiante_correo = serializers.CharField(source='estudiante.correo', read_only=True)
    estudiante_nombre = serializers.CharField(source='estudiante.nombre_completo', read_only=True)
    grupo_nombre = serializers.CharField(source='grupo.nombre', read_only=True)

    class Meta:
        model = InscripcionGrupo
        fields = (
            'id',
            'grupo',
            'grupo_nombre',
            'estudiante',
            'estudiante_correo',
            'estudiante_nombre',
            'fecha_inscripcion',
        )
        read_only_fields = ('id', 'fecha_inscripcion')
