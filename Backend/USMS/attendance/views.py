import csv
from core.permissions import IsAdminOrFaculty
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import Count
from core.permissions import IsAdminOrFaculty
from students.models import StudentProfile
from .models import Attendance, AttendanceSession
from django.utils import timezone
from faculty.models import FacultyProfile
from django.db.models import Count, Q
from datetime import datetime
from rest_framework.decorators import action
from django.db.models import Count, Q
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from .serializers import (
    AttendanceSerializer,
    AttendanceSessionSerializer,
    BulkAttendanceSerializer,
    AttendanceHistorySerializer,
    AttendanceEditSerializer,
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

    @action(
    detail=False,
    methods=["post"],
    url_path="bulk"
    )
    def bulk(self, request):

        serializer = BulkAttendanceSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        session = AttendanceSession.objects.get(
            id=serializer.validated_data["session"]
        )

        records = serializer.validated_data["records"]

        created = []

        with transaction.atomic():

            for record in records:

                student = StudentProfile.objects.get(
                    id=record["student"]
                )

                attendance, created_flag = Attendance.objects.update_or_create(
                    session=session,
                    student=student,
                    defaults={
                        "status": record["status"],
                        "remarks": record.get(
                            "remarks",
                            ""
                        )
                    }
                )

                created.append(attendance.id)

        return Response(
            {
                "message": "Attendance saved successfully",
                "records_created": len(created)
            },
            status=status.HTTP_201_CREATED
        )

    @action(
    detail=False,
    methods=["get"],
    url_path=r"student/(?P<student_id>\d+)/analytics"
)
    def student_analytics(self, request, student_id=None):

        attendance = Attendance.objects.filter(
            student_id=student_id
        )

        total = attendance.count()

        present = attendance.filter(
            status="Present"
        ).count()

        absent = attendance.filter(
            status="Absent"
        ).count()

        late = attendance.filter(
            status="Late"
        ).count()

        percentage = 0

        if total > 0:
            percentage = round(
                (present + late) / total * 100,
                2
            )

        student = StudentProfile.objects.get(
            id=student_id
        )

        return Response({
            "student": student.user.username,
            "overall_percentage": percentage,
            "total_classes": total,
            "present": present,
            "absent": absent,
            "late": late,
        })

    @action(
    detail=False,
    methods=["get"],
    url_path=r"student/(?P<student_id>\d+)/subjects"
)

    def subject_wise_analytics(self, request, student_id=None):

        attendance = (
            Attendance.objects
            .filter(student_id=student_id)
            .select_related(
                "session__subject",
                "session__faculty",
                "session__semester",
                "session__faculty__user"
            )
        )

        subjects = {}

        for record in attendance:

            subject = record.session.subject

            if subject.id not in subjects:

                subjects[subject.id] = {
                    "subject_id": subject.id,
                    "subject": subject.name,
                    "faculty": record.session.faculty.user.username,
                    "semester": record.session.semester.number,
                    "present": 0,
                    "absent": 0,
                    "late": 0,
                    "total_classes": 0,
                }

            subjects[subject.id]["total_classes"] += 1

            if record.status == "Present":
                subjects[subject.id]["present"] += 1

            elif record.status == "Absent":
                subjects[subject.id]["absent"] += 1

            elif record.status == "Late":
                subjects[subject.id]["late"] += 1

        response = []

        for item in subjects.values():

            percentage = 0

            if item["total_classes"] > 0:
                percentage = round(
                    (
                        item["present"] +
                        item["late"]
                    ) / item["total_classes"] * 100,
                    2
                )

            item["attendance_percentage"] = percentage

            item["status"] = (
                "Good"
                if percentage >= 75
                else "Warning"
            )

            response.append(item)

        return Response(response)


    @action(
    detail=False,
    methods=["get"],
    url_path="low-attendance"
)
    def low_attendance(self, request):

        students = StudentProfile.objects.select_related(
            "user",
            "department",
            "current_semester"
        )

        response = []

        for student in students:

            attendance = Attendance.objects.filter(student=student)

            total = attendance.count()

            if total == 0:
                continue

            present = attendance.filter(status="Present").count()
            late = attendance.filter(status="Late").count()

            percentage = round(
                ((present + late) / total) * 100,
                2
            )

            if percentage < 75:

                status_text = (
                    "Critical"
                    if percentage < 60
                    else "Warning"
                )

                response.append({
                    "student_id": student.id,
                    "student": student.user.username,
                    "department": student.department.name,
                    "semester": student.current_semester.number,
                    "attendance_percentage": percentage,
                    "status": status_text,
                })

        response.sort(
            key=lambda x: x["attendance_percentage"]
        )

        return Response(response)

    @action(
    detail=False,
    methods=["get"],
    url_path=r"student/(?P<student_id>\d+)/monthly"
)
    def monthly_attendance(self, request, student_id=None):

        year = request.query_params.get("year")
        month = request.query_params.get("month")

        if not year or not month:
            return Response(
                {
                    "error": "year and month query parameters are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance = Attendance.objects.filter(
            student_id=student_id,
            session__date__year=year,
            session__date__month=month
        )

        total = attendance.count()

        present = attendance.filter(status="Present").count()
        absent = attendance.filter(status="Absent").count()
        late = attendance.filter(status="Late").count()

        percentage = 0

        if total > 0:
            percentage = round(
                ((present + late) / total) * 100,
                2
            )

        student = StudentProfile.objects.get(id=student_id)

        return Response({
            "student": student.user.username,
            "year": int(year),
            "month": int(month),
            "present": present,
            "absent": absent,
            "late": late,
            "total_classes": total,
            "attendance_percentage": percentage,
        })

    @action(
    detail=False,
    methods=["get"],
    url_path=r"faculty/(?P<faculty_id>\d+)/dashboard"
)
    def faculty_dashboard(self, request, faculty_id=None):

        today = timezone.now().date()

        sessions = AttendanceSession.objects.filter(
            faculty_id=faculty_id,
            date=today
        )

        today_sessions = sessions.count()

        completed_sessions = sessions.filter(
            attendance_records__isnull=False
        ).distinct().count()

        pending_sessions = today_sessions - completed_sessions

        students_marked = Attendance.objects.filter(
            session__faculty_id=faculty_id,
            session__date=today
        ).count()

        subject_names = list(
            sessions.values_list(
                "subject__name",
                flat=True
            ).distinct()
        )

        faculty = FacultyProfile.objects.get(
            id=faculty_id
        )

        return Response({
            "faculty": faculty.user.username,
            "today_sessions": today_sessions,
            "completed_sessions": completed_sessions,
            "pending_sessions": pending_sessions,
            "students_marked_today": students_marked,
            "subjects": subject_names,
        })

    @action(
    detail=False,
    methods=["get"],
    url_path="history"
)
    def history(self, request):

        sessions = AttendanceSession.objects.select_related(
            "faculty__user",
            "subject",
            "semester"
        )

        faculty = request.query_params.get("faculty")
        subject = request.query_params.get("subject")
        semester = request.query_params.get("semester")
        date = request.query_params.get("date")

        if faculty:
            sessions = sessions.filter(faculty_id=faculty)

        if subject:
            sessions = sessions.filter(subject_id=subject)

        if semester:
            sessions = sessions.filter(semester_id=semester)

        if date:
            sessions = sessions.filter(date=date)

        serializer = AttendanceHistorySerializer(
            sessions,
            many=True
        )

        return Response(serializer.data)


    @action(
    detail=True,
    methods=["patch"],
    url_path="edit"
)
    def edit_attendance(self, request, pk=None):

        attendance = self.get_object()

        serializer = AttendanceEditSerializer(
            attendance,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": "Attendance updated successfully",
                "attendance": AttendanceSerializer(attendance).data
            },
            status=status.HTTP_200_OK
        )

    @action(
    detail=False,
    methods=["get"],
    url_path="export/csv"
)
    def export_csv(self, request):

        session_id = request.query_params.get("session")

        if not session_id:
            return Response(
                {"error": "session parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance = Attendance.objects.filter(
            session_id=session_id
        ).select_related(
            "student__user"
        )

        response = HttpResponse(content_type="text/csv")

        response["Content-Disposition"] = (
            f'attachment; filename="attendance_session_{session_id}.csv"'
        )

        writer = csv.writer(response)

        writer.writerow([
            "Roll Number",
            "Student",
            "Status",
            "Remarks"
        ])

        for record in attendance:

            writer.writerow([
                record.student.roll_number,
                record.student.user.username,
                record.status,
                record.remarks
            ])

        return response


    @action(
    detail=False,
    methods=["get"],
    url_path="export/pdf"
)
    def export_pdf(self, request):

        session_id = request.query_params.get("session")

        if not session_id:
            return Response(
                {"error": "session parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            session = AttendanceSession.objects.select_related(
                "subject",
                "faculty__user",
                "semester"
            ).get(id=session_id)

        except AttendanceSession.DoesNotExist:
            return Response(
                {"error": "Attendance session not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        attendance = Attendance.objects.filter(
            session=session
        ).select_related(
            "student__user"
        )

        response = HttpResponse(
            content_type="application/pdf"
        )

        response["Content-Disposition"] = (
            f'attachment; filename="attendance_session_{session_id}.pdf"'
        )

        doc = SimpleDocTemplate(response)

        styles = getSampleStyleSheet()

        elements = []

        elements.append(
            Paragraph(
                "<b>UNIFIED STUDENT MANAGEMENT SYSTEM</b>",
                styles["Title"]
            )
        )

        elements.append(
            Paragraph(
                "<b>Attendance Report</b>",
                styles["Heading2"]
            )
        )

        elements.append(Spacer(1, 20))

        info = [
            f"<b>Subject:</b> {session.subject.name}",
            f"<b>Faculty:</b> {session.faculty.user.username}",
            f"<b>Semester:</b> {session.semester.number}",
            f"<b>Date:</b> {session.date}",
            f"<b>Lecture:</b> {session.lecture_number}",
        ]

        for line in info:
            elements.append(
                Paragraph(line, styles["Normal"])
            )

        elements.append(Spacer(1, 20))

        data = [[
            "Roll No",
            "Student",
            "Status",
            "Remarks"
        ]]

        present = 0
        absent = 0
        late = 0

        for record in attendance:

            data.append([
                record.student.roll_number,
                record.student.user.username,
                record.status,
                record.remarks or "-"
            ])

            if record.status == "Present":
                present += 1
            elif record.status == "Absent":
                absent += 1
            elif record.status == "Late":
                late += 1

        table = Table(data)

        table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.darkblue),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("GRID", (0,0), (-1,-1), 1, colors.black),
            ("BACKGROUND", (0,1), (-1,-1), colors.beige),
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("BOTTOMPADDING", (0,0), (-1,0), 10),
        ]))

        elements.append(table)

        elements.append(Spacer(1, 20))

        summary = f"""
        <b>Total Students:</b> {attendance.count()}<br/>
        <b>Present:</b> {present}<br/>
        <b>Absent:</b> {absent}<br/>
        <b>Late:</b> {late}
        """

        elements.append(
            Paragraph(summary, styles["Normal"])
        )

        doc.build(elements)

        return response
    permission_classes = [
        IsAdminOrFaculty
        ]   

    @action(detail=False)

    def my_attendance(self, request):

            student = request.user.studentprofile

            attendance = Attendance.objects.filter(
                student=student
            )

            serializer = self.get_serializer(
                attendance,
                many=True
            )

            return Response(serializer.data)