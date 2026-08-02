import os
import django
from decimal import Decimal
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "USMS.settings")
django.setup()

from accounts.models import User
from departments.models import Department, Course, Semester, Subject
from faculty.models import FacultyProfile
from students.models import StudentProfile
from fees.models import FeeStructure, StudentFee, Payment
from notice.models import Notice
from timetable.models import Classroom, Timetable
from results.models import ExamType, Result

print("Starting DB Seed...")

# 1. Departments
dept_data = [
    ("Computer Engineering", "CE"),
    ("Information Technology", "IT"),
    ("Mechanical Engineering", "ME"),
    ("Electrical Engineering", "EE"),
    ("Civil Engineering", "CIVIL"),
]

depts = {}
for name, code in dept_data:
    d, _ = Department.objects.get_or_create(code=code, defaults={"name": name})
    depts[code] = d

# 2. Courses
course_data = [
    ("B.E. Computer Engineering", "CE", 4),
    ("B.E. Information Technology", "IT", 4),
    ("B.E. Mechanical Engineering", "ME", 4),
    ("B.E. Electrical Engineering", "EE", 4),
    ("B.E. Civil Engineering", "CIVIL", 4),
]

courses = {}
for cname, code, dur in course_data:
    c, _ = Course.objects.get_or_create(name=cname, department=depts[code], defaults={"duration_years": dur})
    courses[code] = c

# 3. Semesters
semesters = {}
for code, course_obj in courses.items():
    for num in range(1, 9):
        sem, _ = Semester.objects.get_or_create(
            course=course_obj,
            number=num,
            defaults={
                "start_date": date(2026, 1 if num % 2 != 0 else 7, 1),
                "end_date": date(2026, 5 if num % 2 != 0 else 12, 15),
            }
        )
        semesters[(code, num)] = sem

# 4. Subjects
subjects_data = [
    ("Python Programming", "CE101", "CE", 1, 4),
    ("Data Structures & Algorithms", "CE201", "CE", 2, 4),
    ("Database Management Systems", "CE301", "CE", 3, 4),
    ("Operating Systems", "CE401", "CE", 4, 4),
    ("Web Technologies", "IT101", "IT", 1, 4),
    ("Cloud Computing", "IT301", "IT", 3, 4),
    ("Thermodynamics", "ME101", "ME", 1, 4),
    ("Fluid Mechanics", "ME201", "ME", 2, 4),
    ("Basic Electrical Engineering", "EE101", "EE", 1, 4),
    ("Control Systems", "EE301", "EE", 3, 4),
    ("Structural Mechanics", "CIVIL101", "CIVIL", 1, 4),
]

subs = {}
for sname, scode, dept_code, sem_num, cred in subjects_data:
    s, _ = Subject.objects.get_or_create(
        code=scode,
        defaults={
            "name": sname,
            "department": depts[dept_code],
            "semester": semesters[(dept_code, sem_num)],
            "credits": cred,
        }
    )
    subs[scode] = s

# 5. Admin User
admin_user, _ = User.objects.get_or_create(
    username="admin",
    defaults={
        "email": "admin@usms.edu",
        "role": "admin",
        "is_staff": True,
        "is_superuser": True,
    }
)
admin_user.set_password("admin123")
admin_user.save()

# 6. Faculty Profiles & Users
faculty_users_data = [
    ("dr_alan_turing", "alan.turing@usms.edu", "EMP-1001", "CE", "Professor", "2020-01-15"),
    ("dr_ada_lovelace", "ada.lovelace@usms.edu", "EMP-1002", "IT", "Associate Professor", "2021-06-01"),
    ("prof_nikola_tesla", "nikola.tesla@usms.edu", "EMP-1003", "EE", "Professor", "2019-08-10"),
    ("dr_richard_feynman", "richard.feynman@usms.edu", "EMP-1004", "ME", "Assistant Professor", "2022-03-20"),
]

faculty_profiles = []
for uname, email, empid, dcode, desig, jdate in faculty_users_data:
    u, _ = User.objects.get_or_create(username=uname, defaults={"email": email, "role": "faculty"})
    u.set_password("faculty123")
    u.save()
    fp, _ = FacultyProfile.objects.get_or_create(
        employee_id=empid,
        defaults={
            "user": u,
            "department": depts[dcode],
            "designation": desig,
            "joining_date": jdate,
        }
    )
    faculty_profiles.append(fp)

# 7. Student Profiles & Users
students_users_data = [
    ("prajwal_sharma", "prajwal@student.usms.edu", "ROLL-2024-001", "ENR-2024-001", "CE", 1, 2024),
    ("rahul_verma", "rahul@student.usms.edu", "ROLL-2024-002", "ENR-2024-002", "CE", 1, 2024),
    ("priya_patel", "priya@student.usms.edu", "ROLL-2024-003", "ENR-2024-003", "IT", 1, 2024),
    ("ananya_sen", "ananya@student.usms.edu", "ROLL-2024-004", "ENR-2024-004", "ME", 2, 2023),
    ("rohan_mehta", "rohan@student.usms.edu", "ROLL-2024-005", "ENR-2024-005", "EE", 1, 2024),
    ("sneha_gupta", "sneha@student.usms.edu", "ROLL-2024-006", "ENR-2024-006", "CIVIL", 1, 2024),
]

student_profiles = []
for uname, email, rnum, enum, dcode, sem_num, ad_yr in students_users_data:
    u, _ = User.objects.get_or_create(username=uname, defaults={"email": email, "role": "student"})
    u.set_password("student123")
    u.save()
    sp, _ = StudentProfile.objects.get_or_create(
        roll_number=rnum,
        defaults={
            "user": u,
            "enrollment_number": enum,
            "department": depts[dcode],
            "course": courses[dcode],
            "current_semester": semesters[(dcode, sem_num)],
            "admission_year": ad_yr,
        }
    )
    student_profiles.append(sp)

# 8. Fee Structures & Student Fees
for dcode, c_obj in courses.items():
    sem_1 = semesters[(dcode, 1)]
    fs, _ = FeeStructure.objects.get_or_create(
        department=depts[dcode],
        course=c_obj,
        semester=sem_1,
        defaults={
            "tuition_fee": Decimal("35000.00"),
            "exam_fee": Decimal("2500.00"),
            "library_fee": Decimal("1500.00"),
            "sports_fee": Decimal("1000.00"),
            "other_fee": Decimal("1000.00"),
            "total_fee": Decimal("41000.00"),
        }
    )

for sp in student_profiles:
    fs = FeeStructure.objects.filter(department=sp.department).first()
    if fs:
        paid = Decimal("25000.00") if sp.id % 2 == 0 else Decimal("41000.00")
        pending = fs.total_fee - paid
        sf, _ = StudentFee.objects.get_or_create(
            student=sp,
            fee_structure=fs,
            defaults={
                "paid_amount": paid,
                "pending_amount": pending,
                "status": "Partial" if pending > 0 else "Paid",
            }
        )

# 9. Classrooms & Timetables
classrooms_data = [
    ("301", "Academic Block A", 60),
    ("302", "Academic Block A", 60),
    ("Lab-1", "Computer Center", 40),
    ("Lab-2", "Mechanical Workshop", 50),
]

rooms = []
for rnum, bld, cap in classrooms_data:
    r, _ = Classroom.objects.get_or_create(room_number=rnum, defaults={"building": bld, "capacity": cap})
    rooms.append(r)

if faculty_profiles and rooms and subs:
    Timetable.objects.get_or_create(
        department=depts["CE"],
        course=courses["CE"],
        semester=semesters[("CE", 1)],
        subject=subs["CE101"],
        faculty=faculty_profiles[0],
        classroom=rooms[0],
        day="Monday",
        defaults={
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        }
    )

# 10. Notices
notices_data = [
    ("End Semester Examination Schedule 2026", "All end-semester theory examinations for Semester 1 to 8 will commence from December 1st, 2026. Detailed timetable is published.", "All", True),
    ("TechFest 2026 Registration Open", "Annual Inter-College Technical Festival 'Technovision 2026' registrations are now open. Contact student coordinators for events.", "Students", True),
    ("Faculty Staff Meeting", "Mandatory academic review meeting for all department heads and faculty members on Friday at 3 PM in Conference Room 1.", "Faculty", False),
    ("Hostel & Library Fee Deadline", "Students are advised to clear all pending library and hostel dues before the examination admit cards are issued.", "Students", False),
]

for title, desc, aud, pinned in notices_data:
    Notice.objects.get_or_create(
        title=title,
        defaults={
            "description": desc,
            "audience": aud,
            "posted_by": admin_user,
            "is_pinned": pinned,
            "expiry_date": date(2026, 12, 31),
        }
    )

# 11. Exam Types
et_mid, _ = ExamType.objects.get_or_create(name="Midterm Examination", defaults={"max_marks": 50, "weightage": 30})
et_end, _ = ExamType.objects.get_or_create(name="End Semester Examination", defaults={"max_marks": 100, "weightage": 70})

print("DB Seeding Complete Successfully!")
