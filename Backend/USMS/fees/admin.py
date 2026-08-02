from django.contrib import admin
from .models import FeeStructure, StudentFee, Payment   
# Register your models here.
admin.site.register(FeeStructure)
admin.site.register(StudentFee)
admin.site.register(Payment)