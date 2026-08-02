from rest_framework.routers import DefaultRouter
from .views import StudentProfileViewSet, StudentInformationFormViewSet

router = DefaultRouter()
router.register(r"students", StudentProfileViewSet)
router.register(r"sif", StudentInformationFormViewSet)

urlpatterns = router.urls