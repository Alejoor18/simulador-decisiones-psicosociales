from django.apps import AppConfig


class PracticasConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.practicas'
    verbose_name = 'Prácticas académicas'

    def ready(self):
        from . import signals  # noqa: F401
