from django.contrib import admin
from api.models import News,Profile,VerificationCode
# Register your models here.

admin.site.register(News)
admin.site.register(Profile)
admin.site.register(VerificationCode)
