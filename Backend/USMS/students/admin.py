from django.contrib import admin
from .models import StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "roll_number",
        "user",
        "department",
        "course",
        "current_semester",
        "admission_year",
    )

    search_fields = (
        "roll_number",
        "enrollment_number",
        "user__username",
    )

    list_filter = (
        "department",
        "course",
        "current_semester",
    )