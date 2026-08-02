from rest_framework.routers import DefaultRouter
from .views import (
    ExamTypeViewSet,
    AcademicYearViewSet,
    ExamSessionViewSet,
    ResultViewSet,
)

router = DefaultRouter()

router.register(r"exam-types", ExamTypeViewSet)
router.register(r"academic-years", AcademicYearViewSet)
router.register(r"exam-sessions", ExamSessionViewSet)
router.register(r"results", ResultViewSet)

urlpatterns = router.urls