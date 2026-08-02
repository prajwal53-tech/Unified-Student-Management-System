from rest_framework.routers import DefaultRouter

from .views import ClassroomViewSet, TimetableViewSet

router = DefaultRouter()

router.register(
    "classrooms",
    ClassroomViewSet
)

router.register(
    "timetable",
    TimetableViewSet
)

urlpatterns = router.urls