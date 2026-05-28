"""
Servicios de IA generativa.

Si hay OPENAI_API_KEY o ANTHROPIC_API_KEY en el .env y la librería
correspondiente está instalada, se intenta usar el LLM real. De lo contrario
se devuelven respuestas STUB plausibles para que el flujo funcione end-to-end
sin keys (útil para desarrollo y demo).
"""

from decouple import config


def _hay_openai() -> bool:
    return bool(config('OPENAI_API_KEY', default=''))


def _hay_anthropic() -> bool:
    return bool(config('ANTHROPIC_API_KEY', default=''))


def generar_caso(tema: str, area: str = '', preguntas_por_escenario: int = 2) -> dict:
    """
    Devuelve un dict con la estructura de un caso completo:
    { nombre, descripcion, contexto_historia, escenarios: [{titulo, narrativa,
      preguntas: [{enunciado, peso, respuestas: [{texto, es_correcta, retroalimentacion}]}]}] }
    """
    if _hay_openai() or _hay_anthropic():
        # TODO: implementar llamada real cuando el usuario configure la key.
        # Por ahora caemos al stub aunque haya key, hasta que confirmes provider.
        pass

    return _stub_caso(tema, area, preguntas_por_escenario)


def _stub_caso(tema: str, area: str, ppe: int) -> dict:
    """Genera un caso plausible sin LLM, con placeholders claros para revisión del docente."""
    tema_seguro = tema.strip() or 'Toma de decisiones'
    area_segura = area.strip() or 'Psicología social aplicada'

    def respuestas_para(esc: int, preg: int) -> list[dict]:
        return [
            {
                'texto': f'Opción A: actuar por presión del grupo (escenario {esc}, preg {preg}).',
                'es_correcta': False,
                'retroalimentacion': 'La conformidad debilita el pensamiento crítico.',
            },
            {
                'texto': f'Opción B: pausa, reflexión y propuesta alternativa (escenario {esc}, preg {preg}).',
                'es_correcta': True,
                'retroalimentacion': 'Asertividad y autonomía moral.',
            },
            {
                'texto': f'Opción C: evadir y delegar la decisión (escenario {esc}, preg {preg}).',
                'es_correcta': False,
                'retroalimentacion': 'Evitación: posterga el conflicto sin resolverlo.',
            },
        ]

    return {
        'nombre': f'{tema_seguro} — caso generado',
        'descripcion': f'Caso introductorio sobre {tema_seguro.lower()} en el contexto de {area_segura}.',
        'area_psicosocial': area_segura,
        'contexto_historia': (
            f'Eres parte de un equipo universitario que enfrenta una situación '
            f'relacionada con {tema_seguro.lower()}. El entorno está cargado de '
            f'expectativas y observan tu reacción tres compañeros y un coordinador.\n\n'
            f'(Texto generado en modo STUB — revisa y edita antes de usarlo en una práctica.)'
        ),
        'desarrollo_situacional': (
            'En las últimas semanas la dinámica del grupo ha cambiado. Las decisiones '
            'que parecían menores ahora condicionan a quienes asumen liderazgo informal.'
        ),
        'escenarios': [
            {
                'titulo': f'Escenario 1 — Inicio del conflicto',
                'narrativa': 'Se presenta una primera tensión que exige tomar postura.',
                'preguntas': [
                    {
                        'enunciado': f'¿Qué decides cuando el grupo presiona ({i + 1})?',
                        'peso': 2,
                        'respuestas': respuestas_para(1, i + 1),
                    } for i in range(ppe)
                ],
            },
            {
                'titulo': f'Escenario 2 — Escalada',
                'narrativa': 'La situación escala y aparecen nuevos actores con intereses propios.',
                'preguntas': [
                    {
                        'enunciado': f'¿Cómo manejas la escalada ({i + 1})?',
                        'peso': 3,
                        'respuestas': respuestas_para(2, i + 1),
                    } for i in range(ppe)
                ],
            },
        ],
    }
