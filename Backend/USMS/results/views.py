from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from core.permissions import IsAdminOrFaculty
from students.models import StudentProfile
from departments.models import Semester
from .services import GPACalculator
from .services import SemesterSummaryService
from .services import CGPACalculator
from .services import RankListService
from .services import TranscriptService
from django.http import FileResponse
from .reports import TranscriptPDF

from .models import (
    ExamType,
    Result,
)

from .serializers import (
    ExamTypeSerializer,
    ResultSerializer,
)


class ExamTypeViewSet(viewsets.ModelViewSet):

    queryset = ExamType.objects.all()

    serializer_class = ExamTypeSerializer

    permission_classes = [
        IsAuthenticated
    ]


class ResultViewSet(viewsets.ModelViewSet):

    queryset = Result.objects.all()

    serializer_class = ResultSerializer

    permission_classes = [
        IsAuthenticated
    ]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "student",
        "subject",
        "semester",
        "exam_type",
    ]

    search_fields = [
        "student__user__username",
        "subject__name",
    ]

    ordering = [
        "-created_at"
    ]

    @action(
        detail=True,
        methods=["get"],
        url_path="calculate"
    )
    def calculate(self, request, pk=None):

        result = self.get_object()

        return Response(
            result.calculate_result()
        )

    @action(
    detail=False,
    methods=["get"],
    url_path="gpa"
)
    def gpa(self, request):

        student_id = request.query_params.get("student")
        semester_id = request.query_params.get("semester")

        student = StudentProfile.objects.get(id=student_id)
        semester = Semester.objects.get(id=semester_id)

        return Response(
            GPACalculator.calculate(student, semester)
        )

    @action(
    detail=False,
    methods=["get"],
    url_path="semester-summary"
)
    def semester_summary(self, request):

        student_id = request.query_params.get("student")
        semester_id = request.query_params.get("semester")

        if not student_id or not semester_id:
            return Response(
                {
                    "error": "student and semester are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        student = StudentProfile.objects.get(id=student_id)
        semester = Semester.objects.get(id=semester_id)

        summary = SemesterSummaryService.get_summary(
            student,
            semester
        )

        return Response(summary)
    @action(
    detail=False,
    methods=["get"],
    url_path="cgpa"
)
    def cgpa(self, request):

        student_id = request.query_params.get("student")

        if not student_id:
            return Response(
                {"error": "student is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        student = StudentProfile.objects.get(id=student_id)

        return Response(
            CGPACalculator.calculate(student)
        )
    @action(
    detail=False,
    methods=["get"],
    url_path="rank-list"
)
    def rank_list(self, request):

        semester_id = request.query_params.get("semester")

        if not semester_id:
            return Response(
                {
                    "error": "semester is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        semester = Semester.objects.get(id=semester_id)

        return Response(
            RankListService.get_rank_list(semester)
        )

    @action(
    detail=False,
    methods=["get"],
    url_path="transcript"
)
    def transcript(self, request):

        student_id = request.query_params.get("student")

        if not student_id:

            return Response(
                {
                    "error": "student is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        student = StudentProfile.objects.get(
            id=student_id
        )

        return Response(
            TranscriptService.generate(student)
        )
    @action(
    detail=False,
    methods=["get"],
    url_path="transcript-pdf"
)
    def transcript_pdf(self, request):

        student_id = request.query_params.get("student")

        if not student_id:
            return Response(
                {"error": "student is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        student = StudentProfile.objects.get(id=student_id)

        transcript = TranscriptService.generate(student)

        pdf = TranscriptPDF.generate(transcript)

        return FileResponse(
            open(pdf, "rb"),
            as_attachment=True,
            filename=pdf
        )
    permission_classes = [
        IsAdminOrFaculty
]