from rest_framework import serializers
from .models import FacultyProfile


class FacultyProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    subject_names = serializers.SerializerMethodField()

    class Meta:
        model = FacultyProfile
        fields = [
            "id",
            "user",
            "username",
            "email",
            "employee_id",
            "department",
            "department_name",
            "designation",
            "subjects",
            "subject_names",
            "joining_date",
            "created_at",
            "updated_at",
        ]

    def get_subject_names(self, obj):
        return [subject.name for subject in obj.subjects.all()]