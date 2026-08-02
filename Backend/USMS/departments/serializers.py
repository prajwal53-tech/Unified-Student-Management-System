from rest_framework import serializers
from .models import Department, Course, Semester, Subject


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class SemesterSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.name", read_only=True)

    class Meta:
        model = Semester
        fields = "__all__"

    def validate_number(self, value):
        if value < 1 or value > 8:
            raise serializers.ValidationError("Semester number must be between 1 and 8.")
        return value


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"