from rest_framework import serializers

from .models import Notice


class NoticeSerializer(serializers.ModelSerializer):

    posted_by_name = serializers.CharField(
        source="posted_by.username",
        read_only=True
    )

    class Meta:

        model = Notice

        fields = "__all__"