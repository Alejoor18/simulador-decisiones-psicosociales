"""Views de la app usuarios: registro docente, perfil y logout JWT."""

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Usuario
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegistroDocenteSerializer,
    UsuarioSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Login que devuelve `access`, `refresh` y `usuario` (con su rol).
    Ahorra al frontend una llamada extra a /perfil/ tras el login.
    """

    serializer_class = CustomTokenObtainPairSerializer


class RegistroDocenteView(generics.CreateAPIView):
    """
    Registro autónomo de docentes (RF01, RN01).
    Endpoint público. Tras crear el usuario devuelve tokens JWT + datos del docente
    para que el frontend pueda iniciar sesión sin un POST extra.
    """

    queryset = Usuario.objects.all()
    serializer_class = RegistroDocenteSerializer
    permission_classes = [AllowAny]

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()

        refresh = RefreshToken.for_user(usuario)
        refresh['rol'] = usuario.rol
        refresh['username'] = usuario.username

        return Response(
            {
                'usuario': UsuarioSerializer(usuario).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class PerfilView(generics.RetrieveAPIView):
    """Devuelve el perfil del usuario autenticado (protegido)."""

    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self) -> Usuario:
        return self.request.user


class LogoutView(APIView):
    """
    Cierra sesión añadiendo el refresh token a la blacklist (RN16, RN26 indirectamente).
    El frontend debe llamar este endpoint y borrar localStorage en paralelo.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        refresh = request.data.get('refresh')
        if not refresh:
            return Response(
                {'detail': 'Se requiere el campo "refresh".'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except TokenError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_205_RESET_CONTENT)
