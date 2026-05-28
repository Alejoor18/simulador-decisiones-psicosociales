"""ViewSets de la app casos: Caso, Escenario, Pregunta, Respuesta, Rubrica."""

from rest_framework import viewsets

from apps.usuarios.models import Usuario
from apps.usuarios.permissions import EsDocenteOAdmin

from .models import Caso, Escenario, Pregunta, Respuesta, Rubrica
from .serializers import (
    CasoDetalleSerializer,
    CasoListSerializer,
    EscenarioSerializer,
    PreguntaSerializer,
    RespuestaSerializer,
    RubricaSerializer,
)


class CasoViewSet(viewsets.ModelViewSet):
    """CRUD de casos. Cada docente solo ve sus casos; admin ve todos."""

    permission_classes = [EsDocenteOAdmin]

    def get_serializer_class(self):
        if self.action in ('retrieve',):
            return CasoDetalleSerializer
        return CasoListSerializer

    def get_queryset(self):
        qs = Caso.objects.select_related('docente_creador').prefetch_related(
            'escenarios__preguntas__respuestas', 'rubrica',
        )
        if self.request.user.rol == Usuario.Rol.ADMIN:
            return qs
        return qs.filter(docente_creador=self.request.user)

    def perform_create(self, serializer):
        serializer.save(docente_creador=self.request.user)


class EscenarioViewSet(viewsets.ModelViewSet):
    serializer_class = EscenarioSerializer
    permission_classes = [EsDocenteOAdmin]

    def get_queryset(self):
        qs = Escenario.objects.select_related('caso').prefetch_related('preguntas__respuestas')
        if self.request.user.rol == Usuario.Rol.ADMIN:
            return qs
        return qs.filter(caso__docente_creador=self.request.user)


class PreguntaViewSet(viewsets.ModelViewSet):
    serializer_class = PreguntaSerializer
    permission_classes = [EsDocenteOAdmin]

    def get_queryset(self):
        qs = Pregunta.objects.select_related('escenario__caso').prefetch_related('respuestas')
        if self.request.user.rol == Usuario.Rol.ADMIN:
            return qs
        return qs.filter(escenario__caso__docente_creador=self.request.user)


class RespuestaViewSet(viewsets.ModelViewSet):
    serializer_class = RespuestaSerializer
    permission_classes = [EsDocenteOAdmin]

    def get_queryset(self):
        qs = Respuesta.objects.select_related('pregunta__escenario__caso')
        if self.request.user.rol == Usuario.Rol.ADMIN:
            return qs
        return qs.filter(pregunta__escenario__caso__docente_creador=self.request.user)


class RubricaViewSet(viewsets.ModelViewSet):
    serializer_class = RubricaSerializer
    permission_classes = [EsDocenteOAdmin]

    def get_queryset(self):
        qs = Rubrica.objects.select_related('caso')
        if self.request.user.rol == Usuario.Rol.ADMIN:
            return qs
        return qs.filter(caso__docente_creador=self.request.user)
