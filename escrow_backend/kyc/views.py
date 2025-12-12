from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from escrows.models import EscrowParticipant

from .serializers import BrokerKYCSerializer, BuyerKYCSerializer, SellerKYCSerializer, get_kyc_model_and_serializer


class KYCViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BuyerKYCSerializer

    def get_participant(self):
        return EscrowParticipant.objects.filter(user=self.request.user).first()

    def get_serializer_class(self):
        participant = self.get_participant()
        if not participant:
            return self.serializer_class

        _, serializer_class = get_kyc_model_and_serializer(participant.role)
        return serializer_class or self.serializer_class

    def get_object(self):
        participant = self.get_participant()
        if not participant:
            return None

        model_class, _ = get_kyc_model_and_serializer(participant.role)
        if not model_class:
            return None

        instance, _ = model_class.objects.get_or_create(participant=participant)
        return instance

    @action(detail=False, methods=['get', 'put'], url_path='me')
    def me(self, request):
        participant = self.get_participant()
        if not participant:
            return Response({'detail': 'No escrow participation found for user.'}, status=status.HTTP_404_NOT_FOUND)

        model_class, serializer_class = get_kyc_model_and_serializer(participant.role)
        if not model_class:
            return Response({'detail': 'Unsupported participant role for KYC.'}, status=status.HTTP_400_BAD_REQUEST)

        instance, _ = model_class.objects.get_or_create(participant=participant)

        if request.method.lower() == 'get':
            serializer = serializer_class(instance)
            return Response(serializer.data)

        serializer = serializer_class(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save(participant=participant)
        return Response(serializer.data)
