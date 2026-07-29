from django.db import models
from accounts.models import User
from departments.models import Department, Course, Semester


class StudentProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile"
    )

    roll_number = models.CharField(
        max_length=20,
        unique=True
    )

    enrollment_number = models.CharField(
        max_length=30,
        unique=True
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.PROTECT
    )

    current_semester = models.ForeignKey(
        Semester,
        on_delete=models.PROTECT
    )

    admission_year = models.PositiveIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )
    def __str__(self):
        return f"{self.user.username} ({self.roll_number})"