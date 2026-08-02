from rest_framework import viewsets
from core.permissions import IsAdminFacultyOrReadOnly
from .models import Notice
from .serializers import NoticeSerializer


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.select_related("posted_by").all()
    serializer_class = NoticeSerializer
    permission_classes = [IsAdminFacultyOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)