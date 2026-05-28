"""Views de Participacion: iniciar, responder, finalizar, progreso."""

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.casos.models import Pregunta, Respuesta
from apps.practicas.models import AutorizacionEstudiante, Practica
from apps.usuarios.models import Usuario

from .models import Participacion, RespuestaSeleccionada
from .serializers import (
    ParticipacionConCasoSerializer,
    ParticipacionSerializer,
    ResponderSerializer,
)


def _es_estudiante(request) -> bool:
    return request.user.is_authenticated and request.user.rol == Usuario.Rol.ESTUDIANTE


class ParticipacionViewSet(viewsets.GenericViewSet):
    """
    Endpoints:
    - POST /api/participaciones/iniciar/  (estudiante autenticado vía /auth/estudiante-acceso/)
    - GET  /api/participaciones/{id}/     (caso anidado para el simulador)
    - POST /api/participaciones/{id}/responder/   {pregunta_id, respuesta_id}
    - POST /api/participaciones/{id}/finalizar/   → calcula Resultado y devuelve resumen
    - GET  /api/participaciones/{id}/progreso/    (estado + n respondidas)
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ParticipacionSerializer

    def get_queryset(self):
        # Estudiante: solo sus participaciones. Docente/Admin: las de sus prácticas/todas.
        u = self.request.user
        qs = Participacion.objects.select_related(
            'practica__caso', 'estudiante', 'autorizacion',
        ).prefetch_related('respuestas_seleccionadas')
        if u.rol == Usuario.Rol.ADMIN:
            return qs
        if u.rol == Usuario.Rol.DOCENTE:
            return qs.filter(practica__docente=u)
        # Estudiante
        return qs.filter(estudiante__usuario=u)

    @action(detail=False, methods=['post'], url_path='iniciar')
    @transaction.atomic
    def iniciar(self, request):
        """
        Inicia (o reanuda) la participación del estudiante en su práctica.
        El estudiante ya viene autenticado con un JWT que contiene
        `autorizacion_id` (emitido por /api/auth/estudiante-acceso/).
        """
        if not _es_estudiante(request):
            raise PermissionDenied('Solo estudiantes pueden iniciar participaciones.')

        autorizacion_id = request.auth.payload.get('autorizacion_id')
        if not autorizacion_id:
            raise ValidationError('El token no contiene autorizacion_id; vuelve a acceder con tu código.')

        autorizacion: AutorizacionEstudiante = get_object_or_404(
            AutorizacionEstudiante.objects.select_related('practica__caso', 'estudiante'),
            pk=autorizacion_id,
        )
        practica = autorizacion.practica

        # Validaciones (RN15, RN16, RN13).
        if practica.estado == Practica.Estado.CANCELADA:
            raise ValidationError('La práctica fue cancelada.')
        if practica.estado == Practica.Estado.FINALIZADA or timezone.now() > practica.fecha_fin:
            raise ValidationError('La práctica ya finalizó.')

        part, creada = Participacion.objects.get_or_create(
            autorizacion=autorizacion,
            defaults={
                'practica': practica,
                'estudiante': autorizacion.estudiante,
                'inicio': timezone.now(),
                'estado': Participacion.Estado.EN_CURSO,
            },
        )

        # Si ya estaba FINALIZADA y no hay reintento autorizado → bloquear (RN16).
        if not creada and part.estado == Participacion.Estado.FINALIZADA and not autorizacion.reintento_autorizado:
            raise ValidationError('Ya finalizaste esta práctica.')

        # Si hay reintento autorizado y estaba finalizada, resetear.
        if not creada and part.estado == Participacion.Estado.FINALIZADA and autorizacion.reintento_autorizado:
            part.estado = Participacion.Estado.EN_CURSO
            part.inicio = timezone.now()
            part.fin = None
            part.tiempo_usado_seg = 0
            part.save()
            part.respuestas_seleccionadas.all().delete()
            # Consumir la autorización de reintento.
            autorizacion.reintento_autorizado = False
            autorizacion.save(update_fields=['reintento_autorizado'])

        return Response(ParticipacionConCasoSerializer(part).data)

    def retrieve(self, request, pk=None):
        part = get_object_or_404(self.get_queryset(), pk=pk)
        return Response(ParticipacionConCasoSerializer(part).data)

    @action(detail=True, methods=['post'], url_path='responder')
    @transaction.atomic
    def responder(self, request, pk=None):
        part: Participacion = get_object_or_404(self.get_queryset(), pk=pk)

        if part.estado == Participacion.Estado.FINALIZADA:
            raise ValidationError('La participación ya está finalizada.')

        ser = ResponderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        pid = ser.validated_data['pregunta_id']
        rid = ser.validated_data['respuesta_id']

        # Validar que la pregunta pertenezca al caso de la práctica.
        pregunta = get_object_or_404(
            Pregunta.objects.filter(escenario__caso=part.practica.caso), pk=pid,
        )
        respuesta = get_object_or_404(
            Respuesta.objects.filter(pregunta=pregunta), pk=rid,
        )

        RespuestaSeleccionada.objects.update_or_create(
            participacion=part, pregunta=pregunta,
            defaults={'respuesta_elegida': respuesta},
        )

        return Response({'detail': 'guardado'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='finalizar')
    @transaction.atomic
    def finalizar(self, request, pk=None):
        from apps.resultados.services import calcular_resultado

        part: Participacion = get_object_or_404(self.get_queryset(), pk=pk)

        if part.estado == Participacion.Estado.FINALIZADA:
            return Response(
                {'detail': 'Ya estaba finalizada.', 'resultado_id': part.resultado.id},
                status=status.HTTP_200_OK,
            )

        part.estado = Participacion.Estado.FINALIZADA
        part.fin = timezone.now()
        if part.inicio:
            part.tiempo_usado_seg = int((part.fin - part.inicio).total_seconds())
        part.save()

        resultado = calcular_resultado(part)
        return Response({
            'detail': 'Participación finalizada.',
            'resultado_id': resultado.id,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='progreso')
    def progreso(self, request, pk=None):
        part: Participacion = get_object_or_404(self.get_queryset(), pk=pk)
        total_preg = Pregunta.objects.filter(escenario__caso=part.practica.caso).count()
        respondidas = part.respuestas_seleccionadas.count()
        return Response({
            'participacion_id': part.id,
            'estado': part.estado,
            'total_preguntas': total_preg,
            'respondidas': respondidas,
            'tiempo_usado_seg': part.tiempo_usado_seg,
        })
