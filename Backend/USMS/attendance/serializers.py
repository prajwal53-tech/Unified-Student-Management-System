from rest_framework import serializers
from .models import Attendance, AttendanceSession


class AttendanceSessionSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(
        source="faculty.user.username",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    semester_number = serializers.IntegerField(
        source="semester.number",
        read_only=True
    )

    class Meta:
        model = AttendanceSession
        fields = [
            "id",
            "faculty",
            "faculty_name",
            "subject",
            "subject_name",
            "semester",
            "semester_number",
            "date",
            "lecture_number",
            "created_at",
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.user.username",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="session.subject.name",
        read_only=True
    )

    faculty_name = serializers.CharField(
        source="session.faculty.user.username",
        read_only=True
    )

    date = serializers.DateField(
        source="session.date",
        read_only=True
    )

    lecture_number = serializers.IntegerField(
        source="session.lecture_number",
        read_only=True
    )

    class Meta:
        model = Attendance
        fields = [
            "id",
            "student",
            "student_name",
            "session",
            "subject_name",
            "faculty_name",
            "date",
            "lecture_number",
            "status",
            "remarks",
            "created_at",
            "updated_at",
        ]

class BulkAttendanceRecordSerializer(serializers.Serializer):
    student = serializers.IntegerField()
    status = serializers.ChoiceField(
        choices=[
            "Present",
            "Absent",
            "Late",
        ]
    )
    remarks = serializers.CharField(
        required=False,
        allow_blank=True
    )


class BulkAttendanceSerializer(serializers.Serializer):
    session = serializers.IntegerField()

    records = BulkAttendanceRecordSerializer(
        many=True
    )

class AttendanceHistorySerializer(serializers.ModelSerializer):

    subject = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    faculty = serializers.CharField(
        source="faculty.user.username",
        read_only=True
    )

    semester = serializers.IntegerField(
        source="semester.number",
        read_only=True
    )

    students_marked = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceSession

        fields = [
            "id",
            "subject",
            "faculty",
            "semester",
            "date",
            "lecture_number",
            "students_marked",
        ]

    def get_students_marked(self, obj):
        return obj.attendance_records.count()


class AttendanceEditSerializer(serializers.ModelSerializer):

    class Meta:
        model = Attendance

        fields = [
            "status",
            "remarks",
        ]