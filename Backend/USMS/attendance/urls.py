from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, AttendanceSessionViewSet

router = DefaultRouter()

router.register(
    r"attendance-sessions",
    AttendanceSessionViewSet
)

router.register(
    r"attendance",
    AttendanceViewSet
)

urlpatterns = router.urls