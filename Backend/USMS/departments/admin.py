from django.contrib import admin
from .models import Department, Course, Semester


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "code")
    search_fields = ("name", "code")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "department", "duration_years")
    list_filter = ("department",)


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "number", "start_date", "end_date")
    list_filter = ("course",)
    
from .models import Department, Course, Semester, Subject

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "code",
        "semester",
        "department",
        "credits",
    )

    list_filter = (
        "department",
        "semester",
    )

    search_fields = (
        "name",
        "code",
    )