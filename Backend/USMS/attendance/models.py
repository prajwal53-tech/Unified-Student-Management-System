from django.db import models
from students.models import StudentProfile
from faculty.models import FacultyProfile
from departments.models import Subject, Semester


class AttendanceSession(models.Model):
    faculty = models.ForeignKey(
        FacultyProfile,
        on_delete=models.CASCADE,
        related_name="attendance_sessions"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE
    )

    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE
    )

    date = models.DateField()

    lecture_number = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            "subject",
            "semester",
            "date",
            "lecture_number",
        )

    def __str__(self):
        return (
            f"{self.subject.name} "
            f"Lecture {self.lecture_number} "
            f"({self.date})"
        )

    
class Attendance(models.Model):

    STATUS_CHOICES = [
        ("Present", "Present"),
        ("Absent", "Absent"),
        ("Late", "Late"),
    ]

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    session = models.ForeignKey(
    AttendanceSession,
    on_delete=models.CASCADE,
    related_name="attendance_records",
    null=True,
    blank=True,
)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="Present"
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        unique_together = (
        "student",
        "session",
)

    def __str__(self):
        return (
        f"{self.student.user.username} - "
        f"{self.session.subject.name}"
)