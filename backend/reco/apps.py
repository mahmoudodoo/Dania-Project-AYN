from django.apps import AppConfig


class RecoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reco'
    def ready(self):
        import api.models
    
