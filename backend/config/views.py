"""Vistas a nivel de proyecto (healthcheck, root)."""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    """Endpoint público para verificar que el backend está vivo."""
    return Response({
        'status': 'ok',
        'service': 'simulador-decisiones-psicosociales',
        'version': '0.1.0',
    })
