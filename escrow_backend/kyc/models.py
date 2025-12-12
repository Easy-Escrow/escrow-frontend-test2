from django.db import models

from escrows.models import EscrowParticipant, EscrowRole


class BaseKYC(models.Model):
    participant = models.OneToOneField(
        EscrowParticipant,
        on_delete=models.CASCADE,
        related_name='%(class)s',
    )
    full_legal_name = models.CharField(max_length=255)
    national_id_number = models.CharField(max_length=100)
    dob = models.DateField()
    address = models.TextField()
    occupation = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    @property
    def role(self):
        return self.participant.role if self.participant else None


class BuyerKYC(BaseKYC):
    source_of_funds = models.CharField(max_length=255, blank=True, null=True)
    tax_id = models.CharField(max_length=100, blank=True, null=True)


class SellerKYC(BaseKYC):
    source_of_funds = models.CharField(max_length=255, blank=True, null=True)
    tax_id = models.CharField(max_length=100, blank=True, null=True)


class BrokerKYC(BaseKYC):
    license_number = models.CharField(max_length=100)
    license_state = models.CharField(max_length=100)
    brokerage_firm_name = models.CharField(max_length=255)

    @property
    def broker_role(self):
        if self.participant and self.participant.role == EscrowRole.CO_BROKER:
            return EscrowRole.CO_BROKER
        return EscrowRole.BROKER
