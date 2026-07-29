from django.contrib import admin
from .models import Attendance, AttendanceSession


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = (
        "subject",
        "semester",
        "faculty",
        "date",
        "lecture_number",
    )

    list_filter = (
        "subject",
        "semester",
        "date",
    )

    search_fields = (
        "subject__name",
        "faculty__user__username",
    )


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "session",
        "status",
    )

    list_filter = (
        "status",
        "session",
    )

    search_fields = (
        "student__user__username",
        "session__subject__name",
    )