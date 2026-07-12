from django.db import models

# Create your models here.
class Student(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    enrollment_number = models.CharField(max_length=20, unique=True)
    date_of_birth = models.DateField()
    age = models.IntegerField()
    phone_number = models.CharField(max_length=15)

    def __str__(self):
        return self.name