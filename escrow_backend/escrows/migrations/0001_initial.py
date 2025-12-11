# Generated manually
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='EscrowTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('agreement_name', models.CharField(max_length=200)),
                ('currency', models.CharField(choices=[('USD', 'USD'), ('MXN', 'MXN'), ('EUR', 'EUR')], max_length=3)),
                ('transaction_type', models.CharField(choices=[('BROKERAGE_COMMISSION', 'Brokerage commission'), ('PROPERTY_SALE', 'Property sale')], max_length=50)),
                ('property_type', models.CharField(choices=[('HOUSE', 'House'), ('APARTMENT', 'Apartment'), ('LAND', 'Land'), ('COMMERCIAL', 'Commercial'), ('OTHER', 'Other')], max_length=20)),
                ('property_value', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ('estimated_closing_date', models.DateField(blank=True, null=True)),
                ('property_address', models.TextField()),
                ('status', models.CharField(choices=[('DRAFT', 'Draft'), ('INVITING', 'Inviting'), ('PENDING_ACCEPTANCE', 'Pending acceptance'), ('ACTIVE', 'Active'), ('CANCELLED', 'Cancelled'), ('COMPLETED', 'Completed')], default='DRAFT', max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_escrow_transactions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='EscrowParticipant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('role', models.CharField(choices=[('BROKER', 'Broker'), ('CO_BROKER', 'Co-broker'), ('BUYER', 'Buyer'), ('SELLER', 'Seller')], max_length=20)),
                ('has_accepted', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('transaction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='participants', to='escrows.escrowtransaction')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='escrow_participations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('transaction', 'email', 'role')},
            },
        ),
        migrations.CreateModel(
            name='CommissionSplit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('broker_share_pct', models.DecimalField(decimal_places=2, max_digits=5)),
                ('co_broker_share_pct', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('broker', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='broker_commission_splits', to=settings.AUTH_USER_MODEL)),
                ('co_broker', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='co_broker_commission_splits', to=settings.AUTH_USER_MODEL)),
                ('transaction', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='commission_split', to='escrows.escrowtransaction')),
            ],
        ),
    ]
