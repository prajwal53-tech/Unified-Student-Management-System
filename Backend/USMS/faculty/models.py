from django.db import models
from accounts.models import User
from departments.models import Department, Subject


class FacultyProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="faculty_profile"
    )

    employee_id = models.CharField(
        max_length=20,
        unique=True
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT
    )

    designation = models.CharField(
        max_length=100
    )

    subjects = models.ManyToManyField(
        Subject,
        blank=True
    )

    joining_date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.username