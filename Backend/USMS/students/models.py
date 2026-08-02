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


class StudentInformationForm(models.Model):
    STATUS_CHOICES = (
        ("Draft", "Draft"),
        ("Submitted", "Submitted"),
        ("Verified", "Verified"),
    )

    GENDER_CHOICES = (
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    )

    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="sif"
    )

    father_name = models.CharField(max_length=100, blank=True, default="")
    mother_name = models.CharField(max_length=100, blank=True, default="")
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default="Male")
    blood_group = models.CharField(max_length=10, blank=True, default="O+")
    category = models.CharField(max_length=20, default="General")
    aadhaar_number = models.CharField(max_length=20, blank=True, default="")

    student_phone = models.CharField(max_length=20, blank=True, default="")
    parent_phone = models.CharField(max_length=20, blank=True, default="")
    permanent_address = models.TextField(blank=True, default="")
    current_address = models.TextField(blank=True, default="")
    city = models.CharField(max_length=50, blank=True, default="")
    state = models.CharField(max_length=50, blank=True, default="")
    pincode = models.CharField(max_length=10, blank=True, default="")

    bank_name = models.CharField(max_length=100, blank=True, default="")
    account_number = models.CharField(max_length=30, blank=True, default="")
    ifsc_code = models.CharField(max_length=20, blank=True, default="")

    tenth_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, default=0.0)
    twelfth_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, default=0.0)
    previous_school_college = models.CharField(max_length=150, blank=True, default="")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Draft")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"SIF - {self.student.user.username} ({self.status})"