import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "USMS.settings")
django.setup()

from students.models import StudentProfile
from faculty.models import FacultyProfile
from departments.models import Subject, Semester
from results.models import ExamType, Result

print("Seeding & Recalculating Academic Results...")

# 1. Ensure Exam Types Exist
mid_sem, _ = ExamType.objects.get_or_create(name="Mid Semester Exam", defaults={"max_marks": 50, "weightage": 30})
end_sem, _ = ExamType.objects.get_or_create(name="End Semester Exam", defaults={"max_marks": 100, "weightage": 70})
practical, _ = ExamType.objects.get_or_create(name="Practical / Lab Assessment", defaults={"max_marks": 50, "weightage": 20})

# 2. Recalculate existing results
existing = Result.objects.all()
for r in existing:
    r.save()
print(f"Recalculated {existing.count()} existing result records.")

# 3. Create rich new demo results for all students
students = list(StudentProfile.objects.select_related("current_semester", "user").all())
faculties = list(FacultyProfile.objects.select_related("user").all())
subjects = list(Subject.objects.select_related("semester").all())

if not students or not faculties or not subjects:
    print("Missing base data (students, faculty, subjects).")
    exit(0)

demo_marks = [
    {"exam": mid_sem, "marks": 42.5, "remarks": "Excellent mid-term performance"},
    {"exam": end_sem, "marks": 88.0, "remarks": "Outstanding end-sem performance"},
    {"exam": practical, "marks": 47.0, "remarks": "High proficiency in lab experiments"},
    {"exam": mid_sem, "marks": 38.0, "remarks": "Good grasp of core concepts"},
    {"exam": end_sem, "marks": 76.5, "remarks": "First Class distinction"},
    {"exam": practical, "marks": 44.0, "remarks": "Satisfactory lab demonstration"},
]

created_count = 0
for idx, st in enumerate(students):
    sem = st.current_semester
    sem_subjects = [sub for sub in subjects if sub.semester == sem]
    if not sem_subjects:
        sem_subjects = subjects[:3]

    faculty = faculties[idx % len(faculties)]

    for s_idx, sub in enumerate(sem_subjects):
        mark_info = demo_marks[(idx + s_idx) % len(demo_marks)]
        exam = mark_info["exam"]
        m_val = mark_info["marks"]

        r, created = Result.objects.get_or_create(
            student=st,
            subject=sub,
            exam_type=exam,
            defaults={
                "faculty": faculty,
                "semester": sem if sem else sub.semester,
                "marks_obtained": m_val,
                "remarks": mark_info["remarks"],
            }
        )
        if created:
            created_count += 1
        else:
            r.save()

print(f"Successfully seeded/updated {created_count} new examination results across {len(students)} students!")
