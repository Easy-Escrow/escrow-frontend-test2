from rest_framework.routers import DefaultRouter

from .views import EscrowTransactionViewSet

router = DefaultRouter()
router.register('escrows', EscrowTransactionViewSet, basename='escrowtransaction')

urlpatterns = router.urls
