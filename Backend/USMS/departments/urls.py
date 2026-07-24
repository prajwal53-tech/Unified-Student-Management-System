from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet,
    CourseViewSet,
    SemesterViewSet,
    SubjectViewSet,
)

router = DefaultRouter()

router.register(r"departments", DepartmentViewSet)
router.register(r"courses", CourseViewSet)
router.register(r"semesters", SemesterViewSet)
router.register(r"subjects", SubjectViewSet)

urlpatterns = router.urls