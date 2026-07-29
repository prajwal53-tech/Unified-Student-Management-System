from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    course_name = serializers.CharField(
        source="course.name",
        read_only=True
    )

    semester = serializers.IntegerField(
        source="current_semester.number",
        read_only=True
    )

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "roll_number",
            "enrollment_number",
            "department",
            "department_name",
            "course",
            "course_name",
            "current_semester",
            "semester",
            "admission_year",
            "created_at",
            "updated_at",
        ]