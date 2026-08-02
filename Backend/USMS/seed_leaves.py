import os
import django
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "USMS.settings")
django.setup()

from faculty.models import FacultyProfile, FacultyLeave

print("Seeding Faculty Leaves...")

f1 = FacultyProfile.objects.filter(employee_id="EMP-1001").first()
f2 = FacultyProfile.objects.filter(employee_id="EMP-1002").first()

if f1:
    FacultyLeave.objects.get_or_create(
        faculty=f1,
        start_date=date(2026, 8, 10),
        end_date=date(2026, 8, 12),
        defaults={
            "leave_type": "Casual Leave",
            "reason": "Attending International AI Conference in Bengaluru.",
            "status": "Approved",
            "admin_remarks": "Approved. Academic substitute assigned.",
        }
    )

if f2:
    FacultyLeave.objects.get_or_create(
        faculty=f2,
        start_date=date(2026, 8, 15),
        end_date=date(2026, 8, 16),
        defaults={
            "leave_type": "Medical Leave",
            "reason": "Routine dental checkup & medical rest.",
            "status": "Pending",
        }
    )

print("Faculty Leaves Seeded Successfully!")
