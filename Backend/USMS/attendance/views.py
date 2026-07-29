from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Attendance, AttendanceSession
from .serializers import (
    AttendanceSerializer,
    AttendanceSessionSerializer,
)


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "faculty",
        "subject",
        "semester",
        "date",
    ]

    search_fields = [
        "subject__name",
        "faculty__user__username",
    ]

    ordering = ["-date"]


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "session",
        "student",
        "status",
    ]

    search_fields = [
        "student__user__username",
        "session__subject__name",
    ]

    ordering = ["-created_at"]