"""Signal: al crear una AutorizacionEstudiante, envía email con el código de acceso."""

from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import AutorizacionEstudiante


@receiver(post_save, sender=AutorizacionEstudiante)
def notificar_estudiante(sender, instance: AutorizacionEstudiante, created: bool, **kwargs):
    if not created:
        return
    practica = instance.practica
    estudiante = instance.estudiante
    asunto = f'Acceso a la práctica: {practica.nombre}'
    cuerpo = (
        f'Hola {estudiante.nombre_completo},\n\n'
        f'Has sido autorizado/a para participar en la práctica académica:\n'
        f'  • {practica.nombre}\n'
        f'  • Caso: {practica.caso.nombre}\n'
        f'  • Inicio: {practica.fecha_inicio:%Y-%m-%d %H:%M}\n'
        f'  • Fin:    {practica.fecha_fin:%Y-%m-%d %H:%M}\n\n'
        f'Tu código de acceso es: {instance.codigo_acceso}\n\n'
        f'Ingresa al simulador con tu correo y este código.\n\n'
        f'(Mensaje del docente: {practica.mensaje_personalizado or "—"})\n'
    )
    try:
        send_mail(
            asunto, cuerpo,
            settings.DEFAULT_FROM_EMAIL,
            [estudiante.correo],
            fail_silently=True,
        )
        instance.notificado = True
        instance.save(update_fields=['notificado'])
    except Exception:
        # No bloquea la creación si el correo falla (la UI muestra el código igualmente).
        pass
