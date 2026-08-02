from django.db import models

from accounts.models import User


class Notice(models.Model):

    AUDIENCE = (

        ("All", "All"),

        ("Students", "Students"),

        ("Faculty", "Faculty"),
    )

    title = models.CharField(
        max_length=255
    )

    description = models.TextField()

    attachment = models.FileField(
        upload_to="notices/",
        blank=True,
        null=True
    )

    audience = models.CharField(
        max_length=20,
        choices=AUDIENCE,
        default="All"
    )

    posted_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    is_pinned = models.BooleanField(default=False)
    expiry_date = models.DateField(null=True, blank=True)

    class Meta:

        ordering = [
            "-created_at"
        ]

    def __str__(self):

        return self.title