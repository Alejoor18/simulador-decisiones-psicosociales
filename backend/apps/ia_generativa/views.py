"""Endpoints de IA generativa."""

from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.casos.models import Caso, Escenario, Pregunta, Respuesta
from apps.usuarios.permissions import EsDocenteOAdmin

from .services import generar_caso


@api_view(['POST'])
@permission_classes([EsDocenteOAdmin])
@transaction.atomic
def generar_caso_view(request):
    """
    POST /api/ia/generar-caso/
    Body: {tema: str, area?: str, preguntas_por_escenario?: int}
    Crea el caso completo en estado GENERADO_IA con escenarios, preguntas y
    respuestas. Devuelve el ID del caso para que el frontend lo abra y el
    docente revise/edite antes de validar (RN10).
    """
    tema = request.data.get('tema', '').strip()
    area = request.data.get('area', '').strip()
    ppe = int(request.data.get('preguntas_por_escenario', 2))
    if not tema:
        return Response({'tema': 'Requerido.'}, status=status.HTTP_400_BAD_REQUEST)

    estructura = generar_caso(tema, area, ppe)

    caso = Caso.objects.create(
        nombre=estructura['nombre'],
        descripcion=estructura['descripcion'],
        contexto_historia=estructura['contexto_historia'],
        desarrollo_situacional=estructura.get('desarrollo_situacional', ''),
        area_psicosocial=estructura.get('area_psicosocial', '') or area,
        estado=Caso.Estado.GENERADO_IA,
        docente_creador=request.user,
    )
    for i, esc in enumerate(estructura['escenarios'], start=1):
        e = Escenario.objects.create(
            caso=caso, orden=i, titulo=esc['titulo'], narrativa=esc.get('narrativa', ''),
        )
        for j, preg in enumerate(esc['preguntas'], start=1):
            p = Pregunta.objects.create(
                escenario=e, orden=j, enunciado=preg['enunciado'], peso=preg.get('peso', 1),
            )
            for k, r in enumerate(preg['respuestas'], start=1):
                Respuesta.objects.create(
                    pregunta=p, orden=k, texto=r['texto'],
                    es_correcta=r.get('es_correcta', False),
                    justificacion=r.get('justificacion', ''),
                    retroalimentacion=r.get('retroalimentacion', ''),
                )

    return Response({'caso_id': caso.id, 'nombre': caso.nombre}, status=status.HTTP_201_CREATED)
