from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed the database with demo data"

    def handle(self, *args, **kwargs):
        self.stdout.write(
            self.style.SUCCESS("Seed command is working!")
        )