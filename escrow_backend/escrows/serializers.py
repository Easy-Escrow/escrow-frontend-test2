from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    CommissionSplit,
    EscrowParticipant,
    EscrowRole,
    EscrowStatus,
    EscrowTransaction,
)

User = get_user_model()


class EscrowParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscrowParticipant
        fields = ['id', 'email', 'role', 'has_accepted', 'created_at', 'updated_at']
        read_only_fields = ['id', 'has_accepted', 'created_at', 'updated_at']


class EscrowTransactionSerializer(serializers.ModelSerializer):
    participants = EscrowParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = EscrowTransaction
        fields = [
            'id',
            'agreement_name',
            'currency',
            'transaction_type',
            'property_type',
            'property_value',
            'estimated_closing_date',
            'property_address',
            'status',
            'created_at',
            'updated_at',
            'participants',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at', 'participants']

    def create(self, validated_data):
        user = self.context['request'].user
        return EscrowTransaction.objects.create(
            created_by=user,
            status=EscrowStatus.INVITING,
            **validated_data,
        )

    def validate(self, attrs):
        request = self.context.get('request')
        if request and not getattr(request.user, 'is_broker', False):
            raise serializers.ValidationError('Only brokers can create escrow transactions.')
        return super().validate(attrs)


class EscrowInviteSerializer(serializers.Serializer):
    cobroker_email = serializers.EmailField(required=False, allow_null=True)
    buyer_email = serializers.EmailField(required=True)
    seller_email = serializers.EmailField(required=False)
    broker_share_pct = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    co_broker_share_pct = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)

    def validate(self, attrs):
        cobroker_email = attrs.get('cobroker_email')
        seller_email = attrs.get('seller_email')
        broker_share_pct = attrs.get('broker_share_pct')
        co_broker_share_pct = attrs.get('co_broker_share_pct')

        if not cobroker_email and not seller_email:
            raise serializers.ValidationError('seller_email is required when no co-broker is specified.')

        if cobroker_email:
            if broker_share_pct is None or co_broker_share_pct is None:
                raise serializers.ValidationError('broker_share_pct and co_broker_share_pct are required when a co-broker is specified.')
            total = broker_share_pct + co_broker_share_pct
            if total != Decimal('100.00'):
                raise serializers.ValidationError('broker_share_pct and co_broker_share_pct must total 100%.')
        else:
            attrs['broker_share_pct'] = Decimal('100.00')
            attrs['co_broker_share_pct'] = None

        return attrs


class EscrowAcceptSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    token = serializers.CharField(required=False, allow_blank=True, allow_null=True)
