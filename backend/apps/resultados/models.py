"""Modelos del dominio Resultados (RF37-RF42, RF47-RF48)."""

from django.db import models

from apps.participaciones.models import Participacion


class Resultado(models.Model):
    """Calificación y retroalimentación final de una participación."""

    participacion = models.OneToOneField(
        Participacion, on_delete=models.CASCADE, related_name='resultado',
    )
    correctas = models.PositiveIntegerField('respuestas correctas', default=0)
    incorrectas = models.PositiveIntegerField('respuestas incorrectas', default=0)
    no_respondidas = models.PositiveIntegerField('preguntas sin responder', default=0)
    peso_obtenido = models.PositiveIntegerField('peso obtenido', default=0)
    peso_total = models.PositiveIntegerField('peso total del caso', default=0)
    nota_final = models.DecimalField('nota final', max_digits=6, decimal_places=2, default=0)
    feedback_docente = models.TextField('feedback general del docente', blank=True)
    notificado_estudiante = models.BooleanField('notificado al estudiante', default=False)
    fecha_calculo = models.DateTimeField('fecha del cálculo', auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Resultado'
        verbose_name_plural = 'Resultados'
        ordering = ['-fecha_calculo']

    def __str__(self) -> str:
        return f'Resultado de {self.participacion.estudiante.correo}: {self.nota_final}'
