from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Department, Course,Subject
from .serializers import DepartmentSerializer, CourseSerializer,SubjectSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
from .models import Department, Course, Semester
from .serializers import (
    DepartmentSerializer,
    CourseSerializer,
    SemesterSerializer,
)

class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [IsAuthenticated]
    
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]