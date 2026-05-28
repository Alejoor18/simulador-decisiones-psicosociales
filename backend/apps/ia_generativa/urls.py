from django.urls import path

from .views import generar_caso_view

app_name = 'ia_generativa'

urlpatterns = [
    path('generar-caso/', generar_caso_view, name='generar_caso'),
]
