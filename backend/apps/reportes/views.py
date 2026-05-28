"""Endpoints de Reportes (admin métricas + descarga PDF/Excel)."""

import io

from django.db.models import Avg, Count
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.academico.models import Estudiante, Grupo
from apps.casos.models import Caso
from apps.practicas.models import Practica
from apps.resultados.models import Resultado
from apps.usuarios.models import Usuario
from apps.usuarios.permissions import EsAdmin, EsDocenteOAdmin


@api_view(['GET'])
@permission_classes([EsAdmin])
def admin_metricas(request):
    """Métricas globales para el dashboard del administrador (RF04, RF44)."""
    return Response({
        'docentes': Usuario.objects.filter(rol=Usuario.Rol.DOCENTE).count(),
        'estudiantes': Estudiante.objects.count(),
        'grupos': Grupo.objects.count(),
        'casos': Caso.objects.count(),
        'practicas': Practica.objects.count(),
        'practicas_por_estado': {
            estado: Practica.objects.filter(estado=estado).count()
            for estado, _ in Practica.Estado.choices
        },
        'resultados': Resultado.objects.count(),
        'nota_promedio': Resultado.objects.aggregate(avg=Avg('nota_final'))['avg'] or 0,
    })


def _resultados_de_practica(practica_id: int, user: Usuario):
    qs = Resultado.objects.select_related(
        'participacion__estudiante', 'participacion__practica__caso',
    ).filter(participacion__practica_id=practica_id)
    if user.rol != Usuario.Rol.ADMIN:
        qs = qs.filter(participacion__practica__docente=user)
    return qs


@api_view(['GET'])
@permission_classes([EsDocenteOAdmin])
def reporte_practica_pdf(request, practica_id: int):
    """GET /api/reportes/practica/{id}/pdf/ — descarga PDF con resultados de la práctica."""
    qs = _resultados_de_practica(practica_id, request.user)
    practica = get_object_or_404(Practica, pk=practica_id)
    if request.user.rol == Usuario.Rol.DOCENTE and practica.docente_id != request.user.id:
        return Response({'detail': 'No autorizado.'}, status=403)

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, title=f'Reporte {practica.nombre}')
    styles = getSampleStyleSheet()
    elements = [
        Paragraph(f'<b>Reporte de práctica</b>: {practica.nombre}', styles['Title']),
        Paragraph(f'Caso: {practica.caso.nombre} · Docente: {practica.docente.get_full_name() or practica.docente.username}', styles['Normal']),
        Paragraph(f'Estado: {practica.get_estado_display()} · Participantes: {qs.count()}', styles['Normal']),
        Spacer(1, 12),
    ]
    data = [['Estudiante', 'Correo', 'Nota', 'Correctas', 'Incorrectas', 'Sin resp.']]
    for r in qs:
        data.append([
            r.participacion.estudiante.nombre_completo,
            r.participacion.estudiante.correo,
            str(r.nota_final),
            r.correctas,
            r.incorrectas,
            r.no_respondidas,
        ])
    if len(data) == 1:
        elements.append(Paragraph('<i>Sin resultados aún.</i>', styles['Italic']))
    else:
        tbl = Table(data, repeatRows=1)
        tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#283593')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f0f0')]),
            ('ALIGN', (2, 1), (-1, -1), 'CENTER'),
        ]))
        elements.append(tbl)
    doc.build(elements)

    resp = HttpResponse(buf.getvalue(), content_type='application/pdf')
    resp['Content-Disposition'] = f'attachment; filename="reporte-practica-{practica_id}.pdf"'
    return resp


@api_view(['GET'])
@permission_classes([EsDocenteOAdmin])
def reporte_practica_excel(request, practica_id: int):
    """GET /api/reportes/practica/{id}/excel/ — descarga XLSX con resultados."""
    qs = _resultados_de_practica(practica_id, request.user)
    practica = get_object_or_404(Practica, pk=practica_id)
    if request.user.rol == Usuario.Rol.DOCENTE and practica.docente_id != request.user.id:
        return Response({'detail': 'No autorizado.'}, status=403)

    wb = Workbook()
    ws = wb.active
    ws.title = 'Resultados'
    ws.append(['Estudiante', 'Correo', 'Nota', 'Correctas', 'Incorrectas', 'Sin resp.', 'Feedback'])
    for r in qs:
        ws.append([
            r.participacion.estudiante.nombre_completo,
            r.participacion.estudiante.correo,
            float(r.nota_final),
            r.correctas, r.incorrectas, r.no_respondidas,
            r.feedback_docente,
        ])

    buf = io.BytesIO()
    wb.save(buf)
    resp = HttpResponse(
        buf.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    resp['Content-Disposition'] = f'attachment; filename="reporte-practica-{practica_id}.xlsx"'
    return resp
