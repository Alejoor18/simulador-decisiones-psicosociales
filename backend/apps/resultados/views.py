"""Views de Resultado."""

from django.shortcuts import get_object_or_404
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.usuarios.models import Usuario

from .models import Resultado
from .serializers import FeedbackDocenteSerializer, ResultadoSerializer


class ResultadoViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ResultadoSerializer

    def get_queryset(self):
        u = self.request.user
        qs = Resultado.objects.select_related(
            'participacion__estudiante', 'participacion__practica__caso',
        )
        if u.rol == Usuario.Rol.ADMIN:
            return qs
        if u.rol == Usuario.Rol.DOCENTE:
            return qs.filter(participacion__practica__docente=u)
        return qs.filter(participacion__estudiante__usuario=u)

    @action(detail=True, methods=['post'], url_path='feedback-docente')
    def feedback_docente(self, request, pk=None):
        if request.user.rol not in (Usuario.Rol.DOCENTE, Usuario.Rol.ADMIN):
            raise PermissionDenied('Solo docentes o administradores pueden dejar feedback.')
        resultado: Resultado = get_object_or_404(self.get_queryset(), pk=pk)
        ser = FeedbackDocenteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        resultado.feedback_docente = ser.validated_data['feedback_docente']
        resultado.save(update_fields=['feedback_docente', 'fecha_actualizacion'])
        return Response(ResultadoSerializer(resultado).data)
