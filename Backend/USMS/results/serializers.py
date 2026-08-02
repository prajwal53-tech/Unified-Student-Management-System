from rest_framework import serializers

from .models import (
    ExamType,
    Result,
)


class ExamTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExamType
        fields = "__all__"


class ResultSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="student.user.username",
        read_only=True
    )

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

    exam_name = serializers.CharField(
        source="exam_type.name",
        read_only=True
    )

    class Meta:

        model = Result

        fields = [
            "id",

            "student",
            "student_name",

            "faculty",
            "faculty_name",

            "subject",
            "subject_name",

            "semester",
            "semester_number",

            "exam_type",
            "exam_name",

            "marks_obtained",
            "remarks",

            "created_at",
            "updated_at",
        ]