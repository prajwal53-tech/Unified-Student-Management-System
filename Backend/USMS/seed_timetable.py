import os
import django
from datetime import time

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "USMS.settings")
django.setup()

from departments.models import Department, Course, Semester, Subject
from faculty.models import FacultyProfile
from timetable.models import Classroom, Timetable

print("Seeding Timetable Demo Data...")

# 1. Create Classrooms
classrooms_data = [
    {"room_number": "LH-101", "building": "Main Academic Block A", "capacity": 75},
    {"room_number": "LH-102", "building": "Main Academic Block A", "capacity": 75},
    {"room_number": "LH-201", "building": "Main Academic Block B", "capacity": 60},
    {"room_number": "LAB-301", "building": "Computer Science Wing", "capacity": 40},
    {"room_number": "LAB-302", "building": "IT Science Wing", "capacity": 40},
    {"room_number": "ME-LAB-101", "building": "Mechanical Workshop", "capacity": 50},
    {"room_number": "EE-LAB-202", "building": "Electrical & Electronics Lab", "capacity": 50},
    {"room_number": "CIVIL-AUD-01", "building": "Civil Engineering Annex", "capacity": 100},
]

classrooms = {}
for cdata in classrooms_data:
    room, _ = Classroom.objects.get_or_create(
        room_number=cdata["room_number"],
        defaults={"building": cdata["building"], "capacity": cdata["capacity"]}
    )
    classrooms[cdata["room_number"]] = room

# 2. Map Subjects & Semesters
subjects = list(Subject.objects.select_related("semester", "semester__course", "semester__course__department").all())
faculties = list(FacultyProfile.objects.select_related("department", "user").all())

if not subjects or not faculties:
    print("Missing subjects or faculty to create timetable.")
    exit(1)

days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
time_slots = [
    (time(9, 0), time(10, 0)),
    (time(10, 0), time(11, 0)),
    (time(11, 15), time(12, 15)),
    (time(12, 15), time(13, 15)),
    (time(14, 0), time(15, 0)),
    (time(15, 0), time(16, 0)),
]

created_count = 0
room_keys = list(classrooms.keys())

for idx, sub in enumerate(subjects):
    sem = sub.semester
    course = sem.course
    dept = course.department
    
    # Assign a faculty member
    faculty = faculties[idx % len(faculties)]
    room = classrooms[room_keys[idx % len(room_keys)]]

    # Create 2 slots per week for each subject
    for day_offset in range(2):
        day = days[(idx * 2 + day_offset) % len(days)]
        slot = time_slots[(idx + day_offset) % len(time_slots)]
        
        tt, created = Timetable.objects.get_or_create(
            department=dept,
            course=course,
            semester=sem,
            subject=sub,
            day=day,
            start_time=slot[0],
            defaults={
                "faculty": faculty,
                "classroom": room,
                "end_time": slot[1],
            }
        )
        if created:
            created_count += 1

print(f"Successfully seeded {created_count} Timetable Schedule Entries across {len(classrooms)} Classrooms!")
