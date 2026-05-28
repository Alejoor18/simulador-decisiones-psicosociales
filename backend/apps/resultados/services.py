"""Servicios de cálculo de Resultado a partir de una Participacion."""

from decimal import Decimal

from apps.casos.models import Pregunta
from apps.participaciones.models import Participacion, RespuestaSeleccionada

from .models import Resultado


def calcular_resultado(participacion: Participacion) -> Resultado:
    """
    Calcula y persiste el Resultado de la participación.

    Reglas:
    - Por cada pregunta del caso, sumar `peso` al peso_total.
    - Si la respuesta seleccionada para esa pregunta es es_correcta=True,
      sumar `peso` al peso_obtenido.
    - Preguntas sin responder cuentan como incorrectas (no suman al
      peso_obtenido) pero se registran aparte como `no_respondidas` (RF48).
    - Nota final = peso_obtenido / peso_total * escala (rubrica.escala_maxima
      si existe, sino 100). RF47 (cero si no participó) está cubierto porque
      si nunca selecciona nada, peso_obtenido=0 → nota=0.
    """
    caso = participacion.practica.caso
    preguntas = list(Pregunta.objects.filter(escenario__caso=caso))

    seleccionadas = {
        rs.pregunta_id: rs
        for rs in RespuestaSeleccionada.objects.filter(
            participacion=participacion,
        ).select_related('respuesta_elegida')
    }

    correctas = 0
    incorrectas = 0
    no_respondidas = 0
    peso_obtenido = 0
    peso_total = sum(p.peso for p in preguntas)

    for p in preguntas:
        rs = seleccionadas.get(p.id)
        if rs is None:
            no_respondidas += 1
            continue
        if rs.respuesta_elegida.es_correcta:
            correctas += 1
            peso_obtenido += p.peso
        else:
            incorrectas += 1

    # Escala desde la rúbrica si existe, sino 100.
    try:
        escala = caso.rubrica.escala_maxima
    except Exception:
        escala = 100

    if peso_total > 0:
        nota = (Decimal(peso_obtenido) / Decimal(peso_total) * Decimal(escala)).quantize(Decimal('0.01'))
    else:
        nota = Decimal('0.00')

    resultado, _ = Resultado.objects.update_or_create(
        participacion=participacion,
        defaults={
            'correctas': correctas,
            'incorrectas': incorrectas,
            'no_respondidas': no_respondidas,
            'peso_obtenido': peso_obtenido,
            'peso_total': peso_total,
            'nota_final': nota,
        },
    )
    return resultado
