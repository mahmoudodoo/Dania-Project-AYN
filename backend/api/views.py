import json
import random
import numpy as np
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils.crypto import get_random_string
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import News, VerificationCode, CrimeData
from .serializers import (
    ProfileSerializer,
    UserSerializer,
    CrimeDataSerializer,
    ResetPasswordSerializer,
)
from .utils import updateNote, getNoteDetail, deleteNote, getNotesList, createNote

def send_verification_code(email, verification_code):
    subject = 'Your Verification Code'
    message = f'Your verification code is {verification_code}.'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)

def verify_email(request, user_id, token):
    user = get_object_or_404(User, id=user_id)
    if default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return HttpResponse('Email verified, you can now login.')
    else:
        return HttpResponse('Verification link is invalid!', status=400)

def send_verification_email(user, request):
    token = default_token_generator.make_token(user)
    verification_link = request.build_absolute_uri(f'/verify-email/{user.id}/{token}/')
    subject = 'Verify your email'
    message = f'Click the link to verify your email: {verification_link}'
    user.email_user(subject, message)

class ResetPasswordRequestView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
            token = get_random_string(32)
            reset_link = f"http://localhost:5173/reset-password?token={token}&email={email}"
            send_mail(
                'Password Reset Request',
                f'Click the link to reset your password: {reset_link}',
                'from@example.com',
                [email],
                fail_silently=False,
            )
            return Response({"success": "Password reset link sent."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ResetPasswordSerializer

    def patch(self, request, token):
        email = request.data.get('email')
        new_password = request.data.get('password')
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            return Response({"success": "Password has been reset."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Invalid token or email."}, status=status.HTTP_400_BAD_REQUEST)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        send_verification_email(user, self.request)

class UserProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_data(request):
    if request.user.is_authenticated:
        user_data = {
            'username': request.user.username,
        }
        return Response(user_data)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        user = User.objects.filter(username=request.data['username']).first()
        if user and not user.is_active:
            return Response({'error': 'Email not verified'}, status=403)


        if user and user.check_password(request.data['password']):
            verification_code = random.randint(100000, 999999)
            VerificationCode.objects.update_or_create(user=user, defaults={'code': verification_code})
            send_verification_code(user.email, verification_code)
            return Response({'message': 'Verification code sent to your email'})

        return Response({'error': 'Invalid credentials'}, status=403)

class VerifyCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        code = request.data.get('code')
        user = User.objects.filter(username=username).first()

        if user:
            verification_code = VerificationCode.objects.filter(user=user).first()
            if verification_code and str(verification_code.code) == code:
                refresh = RefreshToken.for_user(user)
                verification_code.delete()
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def getRoutes(request):
    routes = [
        {
            'Endpoint': '/notes/',
            'method': 'GET',
            'body': None,
            'description': 'Returns an array of notes'
        },
        {
            'Endpoint': '/notes/id',
            'method': 'GET',
            'body': None,
            'description': 'Returns a single note object'
        },
    ]
    return Response(routes)

@api_view(['GET', 'POST'])
def getNotes(request):
    if request.method == 'GET':
        return getNotesList(request)
    elif request.method == 'POST':
        return createNote(request)

@api_view(['GET', 'PUT', 'DELETE'])
def getNote(request, pk):
    if request.method == 'GET':
        return getNoteDetail(request, pk)
    elif request.method == 'PUT':
        return updateNote(request, pk)
    elif request.method == 'DELETE':
        return deleteNote(request, pk)

@api_view(['POST'])
def save_news(request):
    try:
        # Extract data from the request
        title = request.data.get("title")
        body = request.data.get("body")
        updated = request.data.get("updated")
        created = request.data.get("created")
        image = request.FILES.get("image")  # Handle uploaded image

        # Create the News object
        news_item = News.objects.create(
            title=title,
            body=body,
            updated=updated,
            created=created,
            image=image,
        )

        # Add the newly created news to the user's saved news
        profile = request.user.profile
        profile.saved_news.add(news_item)

        return Response({"message": "News item saved"}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_history(request):
    profile = request.user.profile
    serializer = ProfileSerializer(profile)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def history(request, news_id):
    try:
        news_item = News.objects.get(id=news_id)
        profile = request.user.profile
        if news_item in profile.history.all():
            profile.history.remove(news_item)
            profile.history.add(news_item)
            return Response({"message": "News item updated in history list"}, status=status.HTTP_200_OK)
        else:
            profile.history.add(news_item)
            return Response({"message": "News item added to history"}, status=status.HTTP_200_OK)
    except News.DoesNotExist:
        return Response({"error": "News item not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_saved_news(request):
    profile = request.user.profile
    serializer = ProfileSerializer(profile)
    return Response(serializer.data, status=status.HTTP_200_OK)

class CrimeDataPagination(PageNumberPagination):
    page_size = 100

class CrimeDataListView(generics.ListAPIView):
    queryset = CrimeData.objects.all()
    serializer_class = CrimeDataSerializer
    pagination_class = CrimeDataPagination

chicago_community_areas = {
    1: "Rogers Park", 2: "West Ridge", 3: "Uptown", 4: "Lincoln Square", 5: "North Center", 
    6: "Lakeview", 7: "Lincoln Park", 8: "Near North Side", 9: "Edison Park", 10: "Norwood Park",
}

chicago_community_names = {v.lower(): k for k, v in chicago_community_areas.items()}

primary_crimes = {
    0: 'ARSON', 1: 'ASSAULT', 2: 'BATTERY', 3: 'BURGLARY', 
}

class CommunityDataAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request):
        user_input = request.data.get('community', '').strip().lower()

        if user_input in chicago_community_names:
            community_number = chicago_community_names[user_input]
            community_name = chicago_community_areas[community_number]

            total_crimes = int(np.random.uniform(500, 5000))
            crime_rate = round(np.random.uniform(0.5, 10.0), 2)
            description = f"Sample description for {community_name}."
            common_crime = primary_crimes[np.random.randint(0, len(primary_crimes))]

            lat = 41.8781 + (np.random.randn() / 100)
            lon = -87.6298 + (np.random.randn() / 100)

            return Response({
                'name': community_name,
                'total_crimes': total_crimes,
                'crime_rate': crime_rate,
                'description': description,
                'common_crime': common_crime,
                'lat': lat,
                'lon': lon,
            }, status=status.HTTP_200_OK)

        return Response({'error': 'Community area not found.'}, status=status.HTTP_404_NOT_FOUND)
