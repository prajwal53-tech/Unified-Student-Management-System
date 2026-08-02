from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Classroom, Timetable
from .serializers import ClassroomSerializer, TimetableSerializer

from students.models import StudentProfile
from faculty.models import FacultyProfile


class ClassroomViewSet(viewsets.ModelViewSet):

    queryset = Classroom.objects.all()

    serializer_class = ClassroomSerializer


class TimetableViewSet(viewsets.ModelViewSet):

    queryset = Timetable.objects.select_related(
        "subject",
        "faculty",
        "classroom",
        "semester"
    )

    serializer_class = TimetableSerializer

    @action(detail=False, methods=["get"])
    def student(self, request):

        student_id = request.query_params.get("student")

        student = StudentProfile.objects.get(id=student_id)

        timetable = Timetable.objects.filter(
            semester=student.current_semester,
            course=student.course
        )

        serializer = self.get_serializer(
            timetable,
            many=True
        )

        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def faculty(self, request):

        faculty_id = request.query_params.get("faculty")

        faculty = FacultyProfile.objects.get(id=faculty_id)

        timetable = Timetable.objects.filter(
            faculty=faculty
        )

        serializer = self.get_serializer(
            timetable,
            many=True
        )

        return Response(serializer.data)