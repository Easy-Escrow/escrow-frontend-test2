from django.contrib import admin

from .models import CommissionSplit, EscrowParticipant, EscrowTransaction


@admin.register(EscrowTransaction)
class EscrowTransactionAdmin(admin.ModelAdmin):
    list_display = (
        'agreement_name',
        'created_by',
        'transaction_type',
        'property_type',
        'status',
        'created_at',
    )
    list_filter = ('status', 'transaction_type', 'property_type', 'currency')
    search_fields = ('agreement_name', 'property_address', 'created_by__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(EscrowParticipant)
class EscrowParticipantAdmin(admin.ModelAdmin):
    list_display = ('email', 'transaction', 'role', 'has_accepted', 'created_at')
    list_filter = ('role', 'has_accepted')
    search_fields = ('email', 'transaction__agreement_name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CommissionSplit)
class CommissionSplitAdmin(admin.ModelAdmin):
    list_display = (
        'transaction',
        'broker',
        'co_broker',
        'broker_share_pct',
        'co_broker_share_pct',
        'created_at',
    )
    readonly_fields = ('created_at', 'updated_at')
