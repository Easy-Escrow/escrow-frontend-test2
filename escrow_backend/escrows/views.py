from django.db import models
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import User

from .models import CommissionSplit, EscrowParticipant, EscrowRole, EscrowStatus, EscrowTransaction
from .serializers import EscrowAcceptSerializer, EscrowInviteSerializer, EscrowTransactionSerializer


class IsBroker(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action in ['create', 'invite']:
            return bool(request.user and request.user.is_authenticated and request.user.is_broker)
        return True

    def has_object_permission(self, request, view, obj):
        if view.action in ['invite']:
            return obj.created_by_id == request.user.id and request.user.is_broker
        return True


class EscrowTransactionViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = EscrowTransaction.objects.all()
    serializer_class = EscrowTransactionSerializer
    permission_classes = [permissions.IsAuthenticated & IsBroker]

    def perform_create(self, serializer):
        serializer.save()
        EscrowParticipant.objects.get_or_create(
            transaction=serializer.instance,
            email=self.request.user.email,
            role=EscrowRole.BROKER,
            defaults={'user': self.request.user},
        )

    @action(detail=True, methods=['post'], url_path='invite', permission_classes=[permissions.IsAuthenticated, IsBroker])
    def invite(self, request, pk=None):
        transaction = self.get_object()
        serializer = EscrowInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        EscrowParticipant.objects.get_or_create(
            transaction=transaction,
            email=request.user.email,
            role=EscrowRole.BROKER,
            defaults={'user': request.user},
        )

        if data.get('cobroker_email'):
            EscrowParticipant.objects.update_or_create(
                transaction=transaction,
                email=data['cobroker_email'],
                role=EscrowRole.CO_BROKER,
                defaults={'has_accepted': False},
            )

        EscrowParticipant.objects.update_or_create(
            transaction=transaction,
            email=data['buyer_email'],
            role=EscrowRole.BUYER,
            defaults={'has_accepted': False},
        )

        seller_email = data.get('seller_email')
        if seller_email:
            EscrowParticipant.objects.update_or_create(
                transaction=transaction,
                email=seller_email,
                role=EscrowRole.SELLER,
                defaults={'has_accepted': False},
            )

        co_broker_user = None
        if data.get('cobroker_email'):
            co_broker_user = User.objects.filter(email=data['cobroker_email']).first()

        CommissionSplit.objects.update_or_create(
            transaction=transaction,
            defaults={
                'broker': request.user,
                'co_broker': co_broker_user,
                'broker_share_pct': data['broker_share_pct'],
                'co_broker_share_pct': data['co_broker_share_pct'],
            },
        )

        transaction.status = EscrowStatus.PENDING_ACCEPTANCE
        transaction.save(update_fields=['status'])

        response_serializer = EscrowTransactionSerializer(transaction, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='accept', permission_classes=[permissions.IsAuthenticated])
    def accept(self, request, pk=None):
        transaction = self.get_object()
        serializer = EscrowAcceptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get('email') or request.user.email

        participant = transaction.participants.filter(
            models.Q(user=request.user) | models.Q(email=email)
        ).first()

        if not participant:
            return Response({'detail': 'Participant not found for this transaction.'}, status=status.HTTP_404_NOT_FOUND)

        participant.user = participant.user or request.user
        participant.has_accepted = True
        participant.save(update_fields=['user', 'has_accepted', 'updated_at'])

        all_accepted = not transaction.participants.filter(has_accepted=False).exists()
        if all_accepted:
            transaction.status = EscrowStatus.ACTIVE
            transaction.save(update_fields=['status'])

        response_serializer = EscrowTransactionSerializer(transaction, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)
