from rest_framework.routers import DefaultRouter
from .views import FacultyProfileViewSet, FacultyLeaveViewSet

router = DefaultRouter()
router.register(r"faculty", FacultyProfileViewSet)
router.register(r"faculty-leaves", FacultyLeaveViewSet)

urlpatterns = router.urls