from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models


class Currency(models.TextChoices):
    USD = 'USD', 'USD'
    MXN = 'MXN', 'MXN'
    EUR = 'EUR', 'EUR'


class TransactionType(models.TextChoices):
    BROKERAGE_COMMISSION = 'BROKERAGE_COMMISSION', 'Brokerage commission'
    PROPERTY_SALE = 'PROPERTY_SALE', 'Property sale'


class PropertyType(models.TextChoices):
    HOUSE = 'HOUSE', 'House'
    APARTMENT = 'APARTMENT', 'Apartment'
    LAND = 'LAND', 'Land'
    COMMERCIAL = 'COMMERCIAL', 'Commercial'
    OTHER = 'OTHER', 'Other'


class EscrowStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    INVITING = 'INVITING', 'Inviting'
    PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE', 'Pending acceptance'
    ACTIVE = 'ACTIVE', 'Active'
    CANCELLED = 'CANCELLED', 'Cancelled'
    COMPLETED = 'COMPLETED', 'Completed'


class EscrowRole(models.TextChoices):
    BROKER = 'BROKER', 'Broker'
    CO_BROKER = 'CO_BROKER', 'Co-broker'
    BUYER = 'BUYER', 'Buyer'
    SELLER = 'SELLER', 'Seller'


class EscrowTransaction(models.Model):
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='created_escrow_transactions',
    )
    agreement_name = models.CharField(max_length=200)
    currency = models.CharField(max_length=3, choices=Currency.choices)
    transaction_type = models.CharField(max_length=50, choices=TransactionType.choices)
    property_type = models.CharField(max_length=20, choices=PropertyType.choices)
    property_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    estimated_closing_date = models.DateField(null=True, blank=True)
    property_address = models.TextField()
    status = models.CharField(max_length=30, choices=EscrowStatus.choices, default=EscrowStatus.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.agreement_name} ({self.get_status_display()})"

    def clean(self):
        errors = {}

        if self.created_by and not getattr(self.created_by, 'is_broker', False):
            errors['created_by'] = 'Creator must be a broker.'

        if self.pk:
            buyers_exist = self.participants.filter(role=EscrowRole.BUYER).exists()
            sellers_exist = self.participants.filter(role=EscrowRole.SELLER).exists()

            missing_roles = []
            if not buyers_exist:
                missing_roles.append('buyer')
            if not sellers_exist:
                missing_roles.append('seller')

            if missing_roles:
                errors['participants'] = 'Transaction must include at least one ' + ' and '.join(missing_roles) + '.'

        if errors:
            raise ValidationError(errors)


class EscrowParticipant(models.Model):
    transaction = models.ForeignKey(
        EscrowTransaction,
        on_delete=models.CASCADE,
        related_name='participants',
    )
    user = models.ForeignKey(
        'accounts.User',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='escrow_participations',
    )
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=EscrowRole.choices)
    has_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('transaction', 'email', 'role')

    def __str__(self):
        return f"{self.email} - {self.get_role_display()}"


class CommissionSplit(models.Model):
    transaction = models.OneToOneField(
        EscrowTransaction,
        on_delete=models.CASCADE,
        related_name='commission_split',
    )
    broker = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='broker_commission_splits',
    )
    co_broker = models.ForeignKey(
        'accounts.User',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='co_broker_commission_splits',
    )
    broker_share_pct = models.DecimalField(max_digits=5, decimal_places=2)
    co_broker_share_pct = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Commission Split for {self.transaction.agreement_name}"

    def clean(self):
        errors = {}
        hundred = Decimal('100.00')

        if self.co_broker:
            if self.co_broker_share_pct is None:
                errors['co_broker_share_pct'] = 'Co-broker share must be set when a co-broker is assigned.'
            else:
                total = (self.broker_share_pct or Decimal('0')) + self.co_broker_share_pct
                if total != hundred:
                    errors['co_broker_share_pct'] = 'Broker and co-broker shares must total 100%.'
        else:
            if self.co_broker_share_pct is not None:
                errors['co_broker_share_pct'] = 'Co-broker share must be empty when no co-broker is assigned.'
            if self.broker_share_pct != hundred:
                errors['broker_share_pct'] = 'Broker share must equal 100% when no co-broker is assigned.'

        if errors:
            raise ValidationError(errors)
