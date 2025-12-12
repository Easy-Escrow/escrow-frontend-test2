from rest_framework import serializers

from escrows.models import EscrowRole

from .models import BrokerKYC, BuyerKYC, SellerKYC


class BaseKYCSerializer(serializers.ModelSerializer):
    participant_role = serializers.SerializerMethodField()

    class Meta:
        fields = [
            'id',
            'participant',
            'full_legal_name',
            'national_id_number',
            'dob',
            'address',
            'occupation',
            'participant_role',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'participant', 'participant_role', 'created_at', 'updated_at']

    def get_participant_role(self, obj):
        return obj.role


class BuyerKYCSerializer(BaseKYCSerializer):
    class Meta(BaseKYCSerializer.Meta):
        model = BuyerKYC
        fields = BaseKYCSerializer.Meta.fields + ['source_of_funds', 'tax_id']


class SellerKYCSerializer(BaseKYCSerializer):
    class Meta(BaseKYCSerializer.Meta):
        model = SellerKYC
        fields = BaseKYCSerializer.Meta.fields + ['source_of_funds', 'tax_id']


class BrokerKYCSerializer(BaseKYCSerializer):
    class Meta(BaseKYCSerializer.Meta):
        model = BrokerKYC
        fields = BaseKYCSerializer.Meta.fields + [
            'license_number',
            'license_state',
            'brokerage_firm_name',
        ]


def get_kyc_model_and_serializer(role):
    if role in [EscrowRole.BUYER]:
        return BuyerKYC, BuyerKYCSerializer
    if role in [EscrowRole.SELLER]:
        return SellerKYC, SellerKYCSerializer
    if role in [EscrowRole.BROKER, EscrowRole.CO_BROKER]:
        return BrokerKYC, BrokerKYCSerializer
    return None, None
