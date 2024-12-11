from rest_framework.response import Response
from rest_framework import status

def handle_error(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR):
    return Response({'message': message, 'match': None, 'score': None,'image_url': None, 'status': False}, status=status_code)