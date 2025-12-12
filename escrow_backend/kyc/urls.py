from rest_framework.routers import DefaultRouter

from .views import KYCViewSet

router = DefaultRouter()
router.register('kyc', KYCViewSet, basename='kyc')

urlpatterns = router.urls
