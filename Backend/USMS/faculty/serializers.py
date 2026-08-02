from rest_framework import serializers
from accounts.models import User
from .models import FacultyProfile, FacultyLeave


class FacultyProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", required=False, allow_blank=True)
    email = serializers.CharField(source="user.email", required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

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
            "password",
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
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def get_subject_names(self, obj):
        return [subject.name for subject in obj.subjects.all()]

    def create(self, validated_data):
        user_data = validated_data.pop("user", {})
        subjects = validated_data.pop("subjects", [])

        username = user_data.get("username") or validated_data.get("employee_id")
        email = user_data.get("email", "")
        password = validated_data.pop("password", None) or "faculty123"

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role="faculty"
        )

        faculty = FacultyProfile.objects.create(
            user=user,
            **validated_data
        )
        if subjects:
            faculty.subjects.set(subjects)

        return faculty

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        password = validated_data.pop("password", None)

        if "username" in user_data and user_data["username"]:
            new_uname = user_data["username"]
            if User.objects.filter(username=new_uname).exclude(id=instance.user.id).exists():
                raise serializers.ValidationError({"username": "Username already taken."})
            instance.user.username = new_uname
        if "email" in user_data:
            instance.user.email = user_data["email"]
        if password:
            instance.user.set_password(password)
        instance.user.save()

        subjects = validated_data.pop("subjects", None)
        if subjects is not None:
            instance.subjects.set(subjects)

        return super().update(instance, validated_data)


class FacultyLeaveSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source="faculty.user.username", read_only=True)
    employee_id = serializers.CharField(source="faculty.employee_id", read_only=True)
    department_name = serializers.CharField(source="faculty.department.name", read_only=True)

    class Meta:
        model = FacultyLeave
        fields = "__all__"