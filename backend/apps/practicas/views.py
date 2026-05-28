"""ViewSets de prácticas + endpoint público de acceso del estudiante."""

from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.academico.models import Grupo
from apps.usuarios.models import Usuario
from apps.usuarios.permissions import EsDocenteOAdmin

from .models import AutorizacionEstudiante, Practica
from .serializers import (
    AccesoEstudianteSerializer,
    AutorizacionSerializer,
    AutorizarEstudiantesSerializer,
    PracticaDetalleSerializer,
    PracticaListSerializer,
)


class PracticaViewSet(viewsets.ModelViewSet):
    permission_classes = [EsDocenteOAdmin]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PracticaDetalleSerializer
        return PracticaListSerializer

    def get_queryset(self):
        qs = Practica.objects.select_related('caso', 'docente').prefetch_related(
            'autorizaciones__estudiante',
        )
        if self.request.user.rol == Usuario.Rol.ADMIN:
            return qs
        return qs.filter(docente=self.request.user)

    def perform_create(self, serializer):
        serializer.save(docente=self.request.user)

    @action(detail=True, methods=['post'], url_path='autorizar-estudiantes')
    @transaction.atomic
    def autorizar_estudiantes(self, request, pk=None):
        """Autoriza estudiantes (por IDs y/o por grupos) generando códigos de acceso."""
        practica: Practica = self.get_object()
        ser = AutorizarEstudiantesSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        ids_directos = set(ser.validated_data.get('estudiante_ids') or [])
        grupo_ids = ser.validated_data.get('grupo_ids') or []

        # Sumar los estudiantes de los grupos especificados (scopeados al docente).
        if grupo_ids:
            grupos = Grupo.objects.filter(id__in=grupo_ids)
            if request.user.rol == Usuario.Rol.DOCENTE:
                grupos = grupos.filter(docente=request.user)
            for g in grupos:
                ids_directos.update(g.estudiantes.values_list('id', flat=True))

        if not ids_directos:
            raise ValidationError('Debes indicar al menos un estudiante o un grupo con estudiantes.')

        # Crear autorizaciones (idempotente — si ya existe, la ignoramos).
        creadas = []
        for est_id in ids_directos:
            auth, creada = AutorizacionEstudiante.objects.get_or_create(
                practica=practica, estudiante_id=est_id,
            )
            if creada:
                creadas.append(auth)

        return Response({
            'creadas': len(creadas),
            'autorizaciones': AutorizacionSerializer(
                practica.autorizaciones.select_related('estudiante').all(), many=True,
            ).data,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='iniciar')
    def iniciar(self, request, pk=None):
        practica: Practica = self.get_object()
        practica.estado = Practica.Estado.EN_CURSO
        practica.save(update_fields=['estado', 'fecha_actualizacion'])
        return Response(PracticaDetalleSerializer(practica).data)

    @action(detail=True, methods=['post'], url_path='finalizar')
    def finalizar(self, request, pk=None):
        practica: Practica = self.get_object()
        practica.estado = Practica.Estado.FINALIZADA
        practica.save(update_fields=['estado', 'fecha_actualizacion'])
        return Response(PracticaDetalleSerializer(practica).data)

    @action(detail=True, methods=['post'], url_path='autorizar-reintento/(?P<autorizacion_id>[^/.]+)')
    def autorizar_reintento(self, request, pk=None, autorizacion_id=None):
        practica: Practica = self.get_object()
        try:
            auth = practica.autorizaciones.get(pk=autorizacion_id)
        except AutorizacionEstudiante.DoesNotExist:
            raise ValidationError('Autorización no encontrada en esta práctica.')
        auth.reintento_autorizado = True
        auth.save(update_fields=['reintento_autorizado'])
        return Response(AutorizacionSerializer(auth).data)


class AccesoEstudianteView(generics.GenericAPIView):
    """
    Acceso público para estudiantes con correo + código (RF30, RF31).

    Valida:
    - Que el correo esté registrado y tenga autorización para una práctica con
      el código provisto.
    - Que la práctica no esté cancelada ni finalizada (RN15).

    Devuelve datos básicos del estudiante + práctica + un token de acceso
    (JWT efímero limitado al estudiante). El frontend usa el token para
    consumir endpoints de participación.
    """

    permission_classes = [AllowAny]
    serializer_class = AccesoEstudianteSerializer

    def post(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        auth: AutorizacionEstudiante = ser.validated_data['autorizacion']
        practica = auth.practica

        # Validar estado de la práctica.
        if practica.estado == Practica.Estado.CANCELADA:
            raise ValidationError('La práctica fue cancelada.')
        if practica.estado == Practica.Estado.FINALIZADA or timezone.now() > practica.fecha_fin:
            raise ValidationError('La práctica ya finalizó.')

        # Crear/garantizar usuario para el estudiante (rol ESTUDIANTE, sin password).
        estudiante = ser.validated_data['estudiante']
        if not estudiante.usuario_id:
            usuario, _ = Usuario.objects.get_or_create(
                username=f'est_{estudiante.id}',
                defaults={
                    'email': estudiante.correo,
                    'first_name': estudiante.first_name,
                    'last_name': estudiante.last_name,
                    'rol': Usuario.Rol.ESTUDIANTE,
                },
            )
            usuario.set_unusable_password()
            usuario.save()
            estudiante.usuario = usuario
            estudiante.save(update_fields=['usuario'])

        # Generar tokens JWT para esa cuenta.
        refresh = RefreshToken.for_user(estudiante.usuario)
        refresh['rol'] = Usuario.Rol.ESTUDIANTE
        refresh['estudiante_id'] = estudiante.id
        refresh['practica_id'] = practica.id
        refresh['autorizacion_id'] = auth.id

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'estudiante': {
                'id': estudiante.id,
                'correo': estudiante.correo,
                'nombre_completo': estudiante.nombre_completo,
            },
            'practica': {
                'id': practica.id,
                'nombre': practica.nombre,
                'caso_id': practica.caso_id,
                'caso_nombre': practica.caso.nombre,
                'tiempo_max_min': practica.tiempo_max_min,
                'fecha_inicio': practica.fecha_inicio,
                'fecha_fin': practica.fecha_fin,
                'mensaje_personalizado': practica.mensaje_personalizado,
                'estado': practica.estado,
            },
            'autorizacion_id': auth.id,
        })
