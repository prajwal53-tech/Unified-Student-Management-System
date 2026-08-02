from django.db import models
from .services import GradeCalculator
from students.models import StudentProfile
from faculty.models import FacultyProfile
from departments.models import Subject, Semester


class ExamType(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True
    )
    max_marks = models.PositiveIntegerField()
    weightage = models.PositiveIntegerField(
        default=100
    )

    def __str__(self):
        return self.name


class AcademicYear(models.Model):
    name = models.CharField(
        max_length=20,
        unique=True
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return self.name


class ExamSession(models.Model):
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=50
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_published = models.BooleanField(
        default=False
    )

    def __str__(self):
        return (
            f"{self.name} - {self.academic_year.name}"
        )


class Result(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="results"
    )
    faculty = models.ForeignKey(
        FacultyProfile,
        on_delete=models.CASCADE
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE
    )
    semester = models.ForeignKey(
        Semester,
        on_delete=models.CASCADE
    )
    exam_type = models.ForeignKey(
        ExamType,
        on_delete=models.CASCADE
    )
    total_marks = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0
    )
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    grade = models.CharField(
        max_length=5,
        blank=True
    )
    grade_point = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=0
    )
    result_status = models.CharField(
        max_length=10,
        default="PASS"
    )
    marks_obtained = models.DecimalField(
        max_digits=5,
        decimal_places=2
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
            "subject",
            "exam_type",
        )

    def __str__(self):
        return (
            f"{self.student.user.username}"
            f" - {self.subject.name}"
            f" - {self.exam_type.name}"
        )

    def calculate_result(self):
        from .services import GradeCalculator
        max_m = self.exam_type.max_marks if self.exam_type and self.exam_type.max_marks > 0 else 100
        percentage = (float(self.marks_obtained) / max_m) * 100

        grade, grade_point = GradeCalculator.calculate(percentage)

        return {
            "marks": float(self.marks_obtained),
            "percentage": round(percentage, 2),
            "grade": grade,
            "grade_point": grade_point,
            "status": "PASS" if percentage >= 40 else "FAIL"
        }

    def save(self, *args, **kwargs):
        if self.exam_type and self.marks_obtained is not None:
            max_m = self.exam_type.max_marks or 100
            self.total_marks = max_m
            calc = self.calculate_result()
            self.percentage = calc["percentage"]
            self.grade = calc["grade"]
            self.grade_point = calc["grade_point"]
            self.result_status = calc["status"]
        super().save(*args, **kwargs)
