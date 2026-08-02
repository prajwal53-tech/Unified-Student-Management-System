from rest_framework import serializers
from accounts.models import User
from .models import StudentProfile, StudentInformationForm


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", required=False)
    email = serializers.CharField(source="user.email", required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    department_name = serializers.CharField(source="department.name", read_only=True)
    course_name = serializers.CharField(source="course.name", read_only=True)
    semester_number = serializers.IntegerField(source="current_semester.number", read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "password",
            "roll_number",
            "enrollment_number",
            "department",
            "department_name",
            "course",
            "course_name",
            "current_semester",
            "semester_number",
            "admission_year",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def create(self, validated_data):
        user_data = validated_data.pop("user", {})
        username = user_data.get("username") or validated_data.get("roll_number")
        email = user_data.get("email", "")
        password = validated_data.pop("password", None) or "student123"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role="student"
        )

        student = StudentProfile.objects.create(
            user=user,
            **validated_data
        )
        return student

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        password = validated_data.pop("password", None)

        if "username" in user_data and user_data["username"]:
            instance.user.username = user_data["username"]
        if "email" in user_data:
            instance.user.email = user_data["email"]
        if password:
            instance.user.set_password(password)
        instance.user.save()

        return super().update(instance, validated_data)


class StudentInformationFormSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.username", read_only=True)
    roll_number = serializers.CharField(source="student.roll_number", read_only=True)
    enrollment_number = serializers.CharField(source="student.enrollment_number", read_only=True)
    department_name = serializers.CharField(source="student.department.name", read_only=True)
    course_name = serializers.CharField(source="student.course.name", read_only=True)
    semester_number = serializers.IntegerField(source="student.current_semester.number", read_only=True)

    class Meta:
        model = StudentInformationForm
        fields = "__all__"