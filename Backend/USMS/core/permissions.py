from rest_framework.permissions import BasePermission
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsFaculty(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "faculty"
        )


class IsStudent(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "student"
        )


class IsAdminOrFaculty(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in [
                "admin",
                "faculty",
            ]
        )


class IsAdminOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated

        return (
            request.user.is_authenticated
            and request.user.role == "admin"
        )



class IsAdminFacultyOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated

        return (
            request.user.is_authenticated
            and request.user.role in ["admin", "faculty"]
        )