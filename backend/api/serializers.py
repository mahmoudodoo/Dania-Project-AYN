from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile 
from rest_framework import serializers
from .models import CrimeData
from .models import News 


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "email", "first_name", "last_name"]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.is_active = False  # Deactivate account until it is confirmed
        user.save()
        # Send verification email here
        return user
    
    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        return instance


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    saved_news = NewsSerializer(many=True)  # News objects saved by the user
    history= NewsSerializer(many=True)  # News objects saved by the user

    class Meta:
        model = Profile
        fields = [ 'saved_news',"history"]



class CrimeDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrimeData
        fields = '__all__'
