from rest_framework.routers import DefaultRouter
from .views import ClassroomViewSet, TimetableViewSet, ProxyLectureViewSet

router = DefaultRouter()
router.register("classrooms", ClassroomViewSet)
router.register("timetable", TimetableViewSet)
router.register("proxy-lectures", ProxyLectureViewSet)

urlpatterns = router.urls