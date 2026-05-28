"""Serializers de la app usuarios: registro, perfil y JWT custom con datos de usuario."""

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """Representación pública del usuario autenticado (perfil)."""

    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'nombre_completo',
            'rol',
            'date_joined',
        )
        read_only_fields = ('id', 'rol', 'date_joined', 'nombre_completo')

    def get_nombre_completo(self, obj: Usuario) -> str:
        full = obj.get_full_name().strip()
        return full or obj.username


class RegistroDocenteSerializer(serializers.ModelSerializer):
    """
    Serializer para el registro autónomo de docentes (RF01, RN01).
    El campo `rol` se fuerza a DOCENTE y no es editable.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )

    class Meta:
        model = Usuario
        fields = (
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
            'password_confirm',
        )
        extra_kwargs = {
            'email': {'required': True, 'allow_blank': False},
            'first_name': {'required': True, 'allow_blank': False},
            'last_name': {'required': True, 'allow_blank': False},
        }

    def validate_email(self, value: str) -> str:
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con este correo electrónico.')
        return value.lower()

    def validate(self, attrs: dict) -> dict:
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Las contraseñas no coinciden.'})
        try:
            validate_password(attrs['password'])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})
        return attrs

    def create(self, validated_data: dict) -> Usuario:
        password = validated_data.pop('password')
        usuario = Usuario(rol=Usuario.Rol.DOCENTE, **validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Override del serializer de SimpleJWT para incluir el rol como claim del token
    y devolver los datos del usuario junto con los tokens.
    """

    @classmethod
    def get_token(cls, user: Usuario):
        token = super().get_token(user)
        token['rol'] = user.rol
        token['username'] = user.username
        return token

    def validate(self, attrs: dict) -> dict:
        data = super().validate(attrs)
        # self.user es seteado por SimpleJWT durante validate()
        data['usuario'] = UsuarioSerializer(self.user).data
        return data
