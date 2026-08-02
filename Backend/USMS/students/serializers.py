from django.contrib.auth.models import User
from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    email = serializers.EmailField(required=False, allow_blank=True)

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
    )

    course_name = serializers.CharField(
        source="course.name",
        read_only=True,
    )

    semester = serializers.IntegerField(
        source="current_semester.number",
        read_only=True,
    )

    user_name = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:

        model = StudentProfile

        fields = [

            "id",

            "username",
            "password",

            "user_name",

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

        extra_kwargs = {

            "password": {

                "write_only": True

            }

        }

    def create(self, validated_data):

        username = validated_data.pop("username")

        password = validated_data.pop("password")

        email = validated_data.pop("email", "")

        user = User.objects.create_user(

            username=username,

            email=email,

            password=password,

        )

        student = StudentProfile.objects.create(

            user=user,

            **validated_data

        )

        return student