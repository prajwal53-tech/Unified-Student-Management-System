from django.db import models

from departments.models import Department, Course, Semester
from students.models import StudentProfile


class FeeStructure(models.Model):

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

    tuition_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    exam_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    library_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    sports_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    other_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def save(self, *args, **kwargs):

        self.total_fee = (
            self.tuition_fee
            + self.exam_fee
            + self.library_fee
            + self.sports_fee
            + self.other_fee
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.course.name} Semester {self.semester.number}"
class StudentFee(models.Model):

    STATUS = (
        ("Pending", "Pending"),
        ("Partial", "Partial"),
        ("Paid", "Paid"),
    )

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE
    )

    fee_structure = models.ForeignKey(
        FeeStructure,
        on_delete=models.CASCADE
    )

    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    pending_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="Pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):

        self.pending_amount = (
            self.fee_structure.total_fee
            - self.paid_amount
        )

        if self.pending_amount <= 0:

            self.status = "Paid"

        elif self.paid_amount > 0:

            self.status = "Partial"

        else:

            self.status = "Pending"

        super().save(*args, **kwargs)

class Payment(models.Model):

    METHODS = (
        ("Cash", "Cash"),
        ("UPI", "UPI"),
        ("Card", "Card"),
        ("Net Banking", "Net Banking"),
    )

    student_fee = models.ForeignKey(
        StudentFee,
        on_delete=models.CASCADE,
        related_name="payments"
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_method = models.CharField(
        max_length=20,
        choices=METHODS
    )

    transaction_id = models.CharField(
        max_length=100,
        blank=True
    )

    payment_date = models.DateTimeField(
        auto_now_add=True
    )

    remarks = models.TextField(
        blank=True
    )

    def __str__(self):
        return self.transaction_id