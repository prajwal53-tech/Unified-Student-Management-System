from rest_framework.routers import DefaultRouter

from .views import (
    ExamTypeViewSet,
    ResultViewSet,
)

router = DefaultRouter()

router.register(
    r"exam-types",
    ExamTypeViewSet
)

router.register(
    r"results",
    ResultViewSet
)

urlpatterns = router.urls