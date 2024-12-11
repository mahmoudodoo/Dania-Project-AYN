
from django.contrib import admin
from django.urls import path ,include
from reco import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('', include("reco.urls"), name='login'),
]