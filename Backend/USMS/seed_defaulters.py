import os
import django
from datetime import date, timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "USMS.settings")
django.setup()

from students.models import StudentProfile
from faculty.models import FacultyProfile
from departments.models import Subject, Semester
from attendance.models import AttendanceSession, Attendance

print("Seeding Low Attendance Defaulters Data (< 75%)...")

students = list(StudentProfile.objects.select_related("user", "department", "current_semester").all())
faculties = list(FacultyProfile.objects.select_related("user").all())
subjects = list(Subject.objects.select_related("semester").all())

if not students or not faculties or not subjects:
    print("Missing base models to seed attendance.")
    exit(1)

faculty = faculties[0]
today = date.today()

# We want at least 2 students to have < 75% attendance (e.g., Rahul Verma & Priya Patel)
defaulter_targets = ["rahul_verma", "priya_patel", "neha_gupta"]

created_sessions = 0
created_records = 0

for i in range(10):
    session_date = today - timedelta(days=i + 1)
    sub = subjects[i % len(subjects)]
    sem = sub.semester

    sess, _ = AttendanceSession.objects.get_or_create(
        faculty=faculty,
        subject=sub,
        semester=sem,
        date=session_date,
        lecture_number=(i % 3) + 1
    )
    created_sessions += 1

    for st in students:
        uname = st.user.username.lower()
        if uname in defaulter_targets:
            # Mark absent for 6 or 7 out of 10 lectures so percentage is < 60% or < 75%
            att_status = "Absent" if (i % 10) < 6 else "Present"
        else:
            # Regular students get Present
            att_status = "Present"

        rec, created = Attendance.objects.update_or_create(
            session=sess,
            student=st,
            defaults={"status": att_status}
        )
        if created:
            created_records += 1

print(f"Successfully created {created_sessions} Attendance Sessions and {created_records} Student Attendance Records!")
