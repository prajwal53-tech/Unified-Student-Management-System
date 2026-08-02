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


class FacultyLeave(models.Model):
    LEAVE_TYPE_CHOICES = (
        ("Casual Leave", "Casual Leave"),
        ("Medical Leave", "Medical Leave"),
        ("Earned Leave", "Earned Leave"),
        ("Duty Leave", "Duty Leave"),
    )

    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    )

    faculty = models.ForeignKey(
        FacultyProfile,
        on_delete=models.CASCADE,
        related_name="leaves"
    )

    leave_type = models.CharField(max_length=50, choices=LEAVE_TYPE_CHOICES, default="Casual Leave")
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    admin_remarks = models.CharField(max_length=255, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Leave - {self.faculty.user.username} ({self.leave_type} - {self.status})"