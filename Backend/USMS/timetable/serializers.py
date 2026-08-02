from rest_framework import serializers

from .models import Classroom, Timetable


class ClassroomSerializer(serializers.ModelSerializer):

    class Meta:
        model = Classroom
        fields = "__all__"


class TimetableSerializer(serializers.ModelSerializer):

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    faculty_name = serializers.CharField(
        source="faculty.user.username",
        read_only=True
    )

    classroom_name = serializers.CharField(
        source="classroom.room_number",
        read_only=True
    )

    class Meta:
        model = Timetable
        fields = "__all__"

    def validate(self, data):

        start = data["start_time"]
        end = data["end_time"]

        if start >= end:
            raise serializers.ValidationError(
                "End time must be after start time."
            )

        return data