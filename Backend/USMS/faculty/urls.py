from rest_framework.routers import DefaultRouter
from .views import FacultyProfileViewSet

router = DefaultRouter()
router.register(r"faculty", FacultyProfileViewSet)

urlpatterns = router.urls