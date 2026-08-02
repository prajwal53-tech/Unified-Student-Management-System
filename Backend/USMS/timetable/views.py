from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Classroom, Timetable, ProxyLecture
from .serializers import ClassroomSerializer, TimetableSerializer, ProxyLectureSerializer

from students.models import StudentProfile
from faculty.models import FacultyProfile


class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]


class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.select_related(
        "subject",
        "faculty",
        "classroom",
        "semester"
    )
    serializer_class = TimetableSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def student(self, request):
        student_id = request.query_params.get("student")
        if not student_id and hasattr(request.user, "student_profile"):
            student_id = request.user.student_profile.id

        if not student_id:
            return Response({"detail": "Student ID parameter required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = StudentProfile.objects.get(id=student_id)
            timetable = Timetable.objects.filter(
                semester=student.current_semester,
                course=student.course
            )
            serializer = self.get_serializer(timetable, many=True)
            return Response(serializer.data)
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Student record not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["get"])
    def faculty(self, request):
        faculty_id = request.query_params.get("faculty")
        if not faculty_id and hasattr(request.user, "faculty_profile"):
            faculty_id = request.user.faculty_profile.id

        if not faculty_id:
            return Response({"detail": "Faculty ID parameter required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            faculty = FacultyProfile.objects.get(id=faculty_id)
            timetable = Timetable.objects.filter(faculty=faculty)
            serializer = self.get_serializer(timetable, many=True)
            return Response(serializer.data)
        except FacultyProfile.DoesNotExist:
            return Response({"detail": "Faculty record not found."}, status=status.HTTP_404_NOT_FOUND)


class ProxyLectureViewSet(viewsets.ModelViewSet):
    queryset = ProxyLecture.objects.select_related(
        "original_faculty__user", "proxy_faculty__user", "subject", "classroom"
    ).all()
    serializer_class = ProxyLectureSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["approval_status", "original_faculty", "proxy_faculty", "date"]
    search_fields = ["subject__name", "original_faculty__user__username", "proxy_faculty__user__username", "reason"]

    def destroy(self, request, *args, **kwargs):
        proxy = self.get_object()
        user_role = getattr(request.user, "role", "")

        # RULE: While faculty schedule the proxy class without admin approval, the faculty CANNOT cancel/delete the class
        if user_role != "admin" and proxy.approval_status == "Pending Approval":
            return Response(
                {"detail": "Faculty members cannot cancel or delete a pending proxy class without prior administrator review & approval."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        proxy = self.get_object()
        user_role = getattr(request.user, "role", "")

        if user_role != "admin" and request.data.get("approval_status") in ["Approved", "Rejected", "Cancelled"]:
            return Response(
                {"detail": "Only university administrators can approve, reject, or cancel proxy class schedules."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

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
            proxies = ProxyLecture.objects.filter(original_faculty=faculty_profile).order_by("-created_at")
            serializer = self.get_serializer(proxies, many=True)
            return Response(serializer.data)

        # POST - Faculty schedules a Proxy Class
        data = request.data.copy()
        data["original_faculty"] = faculty_profile.id
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save(original_faculty=faculty_profile, approval_status="Pending Approval")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)