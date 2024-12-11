from rest_framework import serializers
import re
from .models import FaceRegistration

class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

class RegisterFaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaceRegistration
        fields = ['face_id', 'face_embedding']


class ImageSerializer(serializers.Serializer):
    face_id = serializers.CharField(max_length=10)

    def validate_face_id(self, value):
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("Face ID must be a 10-digit number.")
        return value



class ImageSerializerTwo(serializers.Serializer):
    image1 = serializers.ImageField(required=True)
    image2 = serializers.ImageField(required=True)
    