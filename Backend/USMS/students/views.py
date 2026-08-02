from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import StudentProfile, StudentInformationForm
from .serializers import StudentProfileSerializer, StudentInformationFormSerializer
from departments.models import Semester, Subject


class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.select_related(
        "user", "department", "course", "current_semester"
    ).all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "department",
        "course",
        "current_semester",
        "admission_year",
    ]

    search_fields = [
        "roll_number",
        "enrollment_number",
        "user__username",
    ]

    ordering_fields = [
        "roll_number",
        "admission_year",
    ]

    ordering = ["roll_number"]

    @action(detail=False, methods=["post"], url_path="bulk-promote")
    def bulk_promote(self, request):
        """Admin Tool: Promote students from a current semester to the next semester."""
        if getattr(request.user, "role", "") != "admin":
            return Response(
                {"detail": "Only university administrators can perform bulk semester promotion.", "message": "Only administrators can perform bulk promotion."},
                status=status.HTTP_403_FORBIDDEN
            )

        from_sem_id = request.data.get("from_semester")
        to_sem_id = request.data.get("to_semester")

        if not from_sem_id or not to_sem_id:
            return Response(
                {"detail": "Both from_semester and to_semester IDs are required.", "message": "Select both source and target semesters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from_sem_id = int(from_sem_id)
            to_sem_id = int(to_sem_id)
            target_sem = Semester.objects.get(id=to_sem_id)
        except (ValueError, Semester.DoesNotExist):
            return Response({"detail": "Target semester not found.", "message": "Selected semester not found."}, status=status.HTTP_404_NOT_FOUND)

        students_to_promote = StudentProfile.objects.filter(current_semester_id=from_sem_id)
        count = students_to_promote.count()

        if count == 0:
            return Response({
                "detail": "No students found in the selected source semester.",
                "message": "No active students found in the selected source semester to promote.",
                "promoted_count": 0
            }, status=status.HTTP_200_OK)

        students_to_promote.update(current_semester=target_sem)

        return Response({
            "message": f"Successfully promoted {count} student(s) to Semester {target_sem.number} ({target_sem.course.name if target_sem.course else ''}).",
            "promoted_count": count
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="admit-card")
    def admit_card(self, request):
        """Student Tool: Generate Exam Hall Ticket / Admit Card data."""
        user = request.user
        try:
            student = user.student_profile
        except StudentProfile.DoesNotExist:
            return Response(
                {"detail": "No student profile associated with this account."},
                status=status.HTTP_404_NOT_FOUND
            )

        sem_num = student.current_semester.number if student.current_semester else 1
        subjects = Subject.objects.filter(semester=student.current_semester) if student.current_semester else []

        subject_list = [
            {
                "code": s.code,
                "name": s.name,
                "credits": s.credits,
                "exam_date": f"2026-08-{(15 + idx * 2):02d}",
                "exam_time": "10:00 AM - 01:00 PM",
            }
            for idx, s in enumerate(subjects)
        ]

        if not subject_list:
            subject_list = [
                {"code": "CS-401", "name": "Data Structures & Algorithms", "credits": 4, "exam_date": "2026-08-18", "exam_time": "10:00 AM - 01:00 PM"},
                {"code": "CS-402", "name": "Database Management Systems", "credits": 4, "exam_date": "2026-08-20", "exam_time": "10:00 AM - 01:00 PM"},
                {"code": "CS-403", "name": "Software Engineering", "credits": 3, "exam_date": "2026-08-22", "exam_time": "10:00 AM - 01:00 PM"},
            ]

        return Response({
            "student_name": user.username,
            "roll_number": student.roll_number,
            "enrollment_number": student.enrollment_number,
            "department": student.department.name if student.department else "Computer Engineering",
            "course": student.course.name if student.course else "B.E. Computer Science",
            "semester_number": sem_num,
            "academic_year": "2025 - 2026",
            "exam_center": "Main Campus Block A - Examination Hall 4",
            "subjects": subject_list
        })


class StudentInformationFormViewSet(viewsets.ModelViewSet):
    queryset = StudentInformationForm.objects.select_related(
        "student__user", "student__department", "student__course", "student__current_semester"
    ).all()
    serializer_class = StudentInformationFormSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "student__department", "student__course"]
    search_fields = ["student__user__username", "student__roll_number", "student__enrollment_number"]

    @action(detail=False, methods=["get", "post", "put", "patch"], url_path="me")
    def me(self, request):
        user = request.user
        try:
            student_profile = user.student_profile
        except StudentProfile.DoesNotExist:
            return Response(
                {"detail": "No student profile associated with this account."},
                status=status.HTTP_404_NOT_FOUND
            )

        sif, _ = StudentInformationForm.objects.get_or_create(student=student_profile)

        if request.method == "GET":
            serializer = self.get_serializer(sif)
            return Response(serializer.data)

        serializer = self.get_serializer(sif, data=request.data, partial=True)
        if serializer.is_valid():
            if user.role == "student" and sif.status != "Verified":
                serializer.save(status="Submitted")
            else:
                serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)