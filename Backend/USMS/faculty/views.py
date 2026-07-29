from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import FacultyProfile
from .serializers import FacultyProfileSerializer


class FacultyProfileViewSet(viewsets.ModelViewSet):
    queryset = FacultyProfile.objects.all()
    serializer_class = FacultyProfileSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "department",
        "designation",
    ]

    search_fields = [
        "employee_id",
        "user__username",
        "designation",
    ]

    ordering_fields = [
        "employee_id",
        "joining_date",
    ]

    ordering = ["employee_id"]