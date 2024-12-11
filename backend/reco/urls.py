from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView ,MyTokenObtainPairView
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from reco.views import FaceCompare 
from api import views
urlpatterns = [
    path('api/user/', views.get_user_data, name='get_user_data'),
    path("api/user/register/",CreateUserView.as_view() , name="register"),
    path("api/token/", MyTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/verify-code/", views.VerifyCodeView.as_view(), name="verify_code"),
    path("api-auth/", include("rest_framework.urls")),
    path('face_verify/', FaceCompare.as_view()),
    path("api/", include("api.urls")),
    path('api/notes/', views.getNotes, name="notes"),
    path('api/profile/', views.UserProfileUpdateView.as_view(), name="profile"),
    path('api/reset-password/', views.ResetPasswordRequestView.as_view(), name='reset-password'),
    path('api/reset-password/<str:token>/', views.PasswordResetConfirmView.as_view(), name='reset-password-confirm'),

    path('api/notes/<str:pk>/', views.getNote, name="note"),
    path('api/save-news/', views.save_news, name="save"),
    path('api/saved-news/', views.get_saved_news, name="saved"),
    path('api/add-history/<int:news_id>/', views.history, name="savetohistory"),
    path('api/history/', views.get_history, name="history"),
    path('verify-email/<int:user_id>/<str:token>/', views.verify_email, name='verify_email'),
    path('api/crimes/', views.CrimeDataListView.as_view(), name='crime-list'),
    path('api/community_data/', views.CommunityDataAPIView.as_view(), name='community_data'),
]