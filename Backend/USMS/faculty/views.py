from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import FacultyProfile, FacultyLeave
from .serializers import FacultyProfileSerializer, FacultyLeaveSerializer


class FacultyProfileViewSet(viewsets.ModelViewSet):
    queryset = FacultyProfile.objects.select_related("user", "department").prefetch_related("subjects").all()
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


class FacultyLeaveViewSet(viewsets.ModelViewSet):
    queryset = FacultyLeave.objects.select_related("faculty__user", "faculty__department").all()
    serializer_class = FacultyLeaveSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "leave_type", "faculty__department"]
    search_fields = ["faculty__user__username", "faculty__employee_id", "reason"]

    def update(self, request, *args, **kwargs):
        if getattr(request.user, "role", "") != "admin":
            return Response(
                {"detail": "Only university administrators can approve or reject faculty leave applications."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if getattr(request.user, "role", "") != "admin":
            return Response(
                {"detail": "Only university administrators can approve or reject faculty leave applications."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=["get", "post"], url_path="me")
    def me(self, request):
        user = request.user
        try:
            faculty_profile = user.faculty_profile
        except FacultyProfile.DoesNotExist:
            return Response(
                {"detail": "No faculty profile linked with this account."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.method == "GET":
            leaves = FacultyLeave.objects.filter(faculty=faculty_profile).order_by("-created_at")
            serializer = self.get_serializer(leaves, many=True)
            return Response(serializer.data)

        # POST - Submit Leave Request
        data = request.data.copy()
        data["faculty"] = faculty_profile.id
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save(faculty=faculty_profile, status="Pending")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)