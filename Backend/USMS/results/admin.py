from django.contrib import admin

from .models import (
    ExamType,
    Result,
)


@admin.register(ExamType)
class ExamTypeAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "max_marks",
        "weightage",
    )


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):

    list_display = (
        "student",
        "subject",
        "exam_type",
        "marks_obtained",
    )

    list_filter = (
        "subject",
        "semester",
        "exam_type",
    )

    search_fields = (
        "student__user__username",
        "subject__name",
    )