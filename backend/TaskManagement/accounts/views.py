from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):

        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not username or not email or not password:
            return Response(
                {"message": "All fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"message": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "User registered successfully",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {"message": "Invalid username or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "Login successful",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            },
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Token "):
            token_key = auth_header.split(" ")[1]
            Token.objects.filter(key=token_key).delete()
        elif request.user.is_authenticated:
            Token.objects.filter(user=request.user).delete()

        logout(request)

        return Response(
            {"message": "Logout successful"},
            status=status.HTTP_200_OK
        )