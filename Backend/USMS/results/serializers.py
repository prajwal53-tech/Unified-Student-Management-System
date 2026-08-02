from rest_framework import serializers

from .models import (
    ExamType,
    AcademicYear,
    ExamSession,
    Result,
)


class ExamTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamType
        fields = "__all__"


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = "__all__"


class ExamSessionSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(
        source="academic_year.name",
        read_only=True
    )

    class Meta:
        model = ExamSession
        fields = "__all__"


class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.user.username",
        read_only=True
    )
    roll_number = serializers.CharField(
        source="student.roll_number",
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
    max_marks = serializers.IntegerField(
        source="exam_type.max_marks",
        read_only=True
    )

    class Meta:
        model = Result
        fields = [
            "id",
            "student",
            "student_name",
            "roll_number",
            "faculty",
            "faculty_name",
            "subject",
            "subject_name",
            "semester",
            "semester_number",
            "exam_type",
            "exam_name",
            "max_marks",
            "marks_obtained",
            "total_marks",
            "percentage",
            "grade",
            "grade_point",
            "result_status",
            "remarks",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        result = super().create(validated_data)
        calc = result.calculate_result()
        result.percentage = calc["percentage"]
        result.grade = calc["grade"]
        result.grade_point = calc["grade_point"]
        result.result_status = calc["status"]
        result.total_marks = result.exam_type.max_marks
        result.save()
        return result

    def update(self, instance, validated_data):
        result = super().update(instance, validated_data)
        calc = result.calculate_result()
        result.percentage = calc["percentage"]
        result.grade = calc["grade"]
        result.grade_point = calc["grade_point"]
        result.result_status = calc["status"]
        result.total_marks = result.exam_type.max_marks
        result.save()
        return result