from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/v1/auth/", include("accounts.urls")),

    path("api/v1/", include("departments.urls")),

    path("api/v1/", include("students.urls")),

    path("api/v1/", include("faculty.urls")),

    path("api/v1/", include("attendance.urls")),
]