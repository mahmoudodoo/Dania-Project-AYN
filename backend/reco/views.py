from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from PIL import Image, UnidentifiedImageError
import numpy as np
import os
from django.utils.text import slugify

from deepface import DeepFace
from .serializer import ImageSerializerTwo
from django.utils.text import get_valid_filename

# Function to find cosine similarity
def find_cosine_distance(source_representation: np.ndarray, test_representation: np.ndarray):
    a = np.matmul(np.transpose(source_representation), test_representation)
    b = np.sum(np.multiply(source_representation, source_representation))
    c = np.sum(np.multiply(test_representation, test_representation))
    return 1 - (a / (np.sqrt(b) * np.sqrt(c)))


# Function to open and return the face array from the image
def get_face(file_path):
    try:
        with Image.open(file_path) as image:
            image = image.convert('RGB')
            face_array = np.asarray(image)
        return face_array
    except UnidentifiedImageError:
        return None  # Return None if the image is not identifiable

class FaceCompare(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ImageSerializerTwo(data=request.data)
        if serializer.is_valid():
            image1 = serializer.validated_data['image1']
            image2 = serializer.validated_data['image2']
            username = request.data.get('username')  # Get the username from the request

            if not username:
                return Response({'message': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)

            result_data = {}
            error_data = []

            def process_image(image, key):
                try:
                    face = get_face(image)
                    if face is None:
                        raise ValueError(f'No Face Detected in {key}.')
                    embedding_objs = DeepFace.represent(face, detector_backend='mtcnn', model_name="Facenet512")
                    result_data[key] = np.array(embedding_objs[0]['embedding']) if isinstance(embedding_objs[0], dict) else embedding_objs[0]
                except Exception as e:
                    error_data.append(f'Error processing {key}: {str(e)}')

            # Ensure username is safe for file path
            safe_username = slugify(username)

            # Define the path where the registered face image would be stored securely
            safe_username = get_valid_filename(username)
            image_path = os.path.join(settings.MEDIA_ROOT, 'registered_faces', f'{safe_username}.jpg')

            if os.path.exists(image_path):
                # If the face image for this username exists, compare the new image1 with the saved image
                saved_face = get_face(image_path)

                if saved_face is None:
                    return Response({'message': 'Could not open saved image for this username.'}, status=status.HTTP_400_BAD_REQUEST)

                process_image(image1, 'new_face')

                if 'new_face' not in result_data:
                    return Response({'message': 'Face detection failed on new image.'}, status=status.HTTP_400_BAD_REQUEST)

                saved_embedding = DeepFace.represent(saved_face, detector_backend='mtcnn', model_name="Facenet512")[0]['embedding']
                cosine_similarity = find_cosine_distance(np.array(saved_embedding), np.array(result_data['new_face']))

                if cosine_similarity <= 0.5:
                    message = 'Face Matched'
                else:
                    message = 'Face Not Matched'

                return Response({
                    'message': message,
                    'score': round(cosine_similarity, 2)
                }, status=status.HTTP_200_OK)

            else:
                # If no saved image exists for the username, process the two images for registration
                process_image(image1, 'face1')
                process_image(image2, 'face2')

                if error_data:
                    return Response({'message': ' '.join(error_data), 'score': None}, status=status.HTTP_400_BAD_REQUEST)

                face1 = result_data.get('face1')
                face2 = result_data.get('face2')

                if face1 is None or face2 is None:
                    return Response({'message': 'Face detection failed on one or both images.'}, status=status.HTTP_400_BAD_REQUEST)

                cosine_similarity = find_cosine_distance(face1, face2)

                if cosine_similarity <= 0.5:
                    # Save image1 with the username for future login, ensuring secure storage
                    image1.seek(0) # Ensure file pointer is at the beginning of the image
                    safe_image_path = f'registered_faces/{safe_username}.jpg'
                    default_storage.save(safe_image_path, ContentFile(image1.read()))
                    message = 'Face Matched'
                else:
                    message = 'Face Not Matched'

                return Response({
                    'message': message,
                    'score': round(cosine_similarity, 2)
                }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)