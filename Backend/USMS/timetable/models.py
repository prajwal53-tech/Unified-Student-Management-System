from django.db import models

from departments.models import Department, Course, Semester, Subject
from faculty.models import FacultyProfile


class Classroom(models.Model):

    room_number = models.CharField(max_length=20, unique=True)

    building = models.CharField(max_length=100)

    capacity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.building} - {self.room_number}"


class Timetable(models.Model):

    DAYS = [
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
        ("Saturday", "Saturday"),
    ]

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE
    )

    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE
    )

    faculty = models.ForeignKey(
        FacultyProfile,
        on_delete=models.CASCADE
    )

    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE
    )

    day = models.CharField(
        max_length=20,
        choices=DAYS
    )

    start_time = models.TimeField()

    end_time = models.TimeField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = [
            "day",
            "start_time"
        ]

    def __str__(self):
        return (
            f"{self.subject.name} "
            f"{self.day}"
        )