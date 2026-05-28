from django.urls import path

from .views import admin_metricas, reporte_practica_excel, reporte_practica_pdf

app_name = 'reportes'

urlpatterns = [
    path('admin/metricas/', admin_metricas, name='admin_metricas'),
    path('practica/<int:practica_id>/pdf/', reporte_practica_pdf, name='reporte_practica_pdf'),
    path('practica/<int:practica_id>/excel/', reporte_practica_excel, name='reporte_practica_excel'),
]
