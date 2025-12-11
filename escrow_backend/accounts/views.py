from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BrokerRequest, User
from .serializers import (
    BrokerRequestSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class BrokerRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        has_pending_request = BrokerRequest.objects.filter(
            user=request.user, status=BrokerRequest.Status.PENDING
        ).exists()

        if has_pending_request:
            return Response(
                {'detail': 'A pending broker request already exists.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        broker_request = BrokerRequest.objects.create(user=request.user)
        serializer = BrokerRequestSerializer(broker_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
