from django.urls import path

from .views import BrokerRequestView

urlpatterns = [
    path('request-broker/', BrokerRequestView.as_view(), name='request-broker'),
]
