from rest_framework import serializers

from .models import (
    FeeStructure,
    StudentFee,
    Payment
)


class FeeStructureSerializer(serializers.ModelSerializer):

    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    course_name = serializers.CharField(
        source="course.name",
        read_only=True
    )

    semester_number = serializers.IntegerField(
        source="semester.number",
        read_only=True
    )

    class Meta:
        model = FeeStructure
        fields = "__all__"
        read_only_fields = [
            "total_fee",
        ]


class StudentFeeSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="student.user.username",
        read_only=True
    )

    roll_number = serializers.CharField(
        source="student.roll_number",
        read_only=True
    )

    class Meta:
        model = StudentFee
        fields = "__all__"


class PaymentSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="student_fee.student.user.username",
        read_only=True
    )

    class Meta:
        model = Payment
        fields = "__all__"