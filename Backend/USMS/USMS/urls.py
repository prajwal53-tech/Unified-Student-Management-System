from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/", include("departments.urls")),
    path("api/v1/", include("students.urls")),
    path("api/v1/", include("faculty.urls")),
    path("api/v1/", include("attendance.urls")),
    path("api/v1/", include("results.urls")),
    path("api/v1/", include("fees.urls")),
    path("api/v1/", include("timetable.urls")),
    path("api/v1/", include("notice.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

urlpatterns += [
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),

    path(
        "swagger/",
        SpectacularSwaggerView.as_view(
            url_name="schema"
        ),
        name="swagger-ui",
    ),

    path(
        "redoc/",
        SpectacularRedocView.as_view(
            url_name="schema"
        ),
        name="redoc",
    ),
]