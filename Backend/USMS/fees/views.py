from rest_framework import viewsets
from django.db import transaction
from rest_framework import status
from django.db.models import Sum
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.response import Response
from core.permissions import IsAdmin

from .models import (
    FeeStructure,
    StudentFee,
    Payment
)

from .serializers import (
    FeeStructureSerializer,
    StudentFeeSerializer,
    PaymentSerializer
)


class FeeStructureViewSet(viewsets.ModelViewSet):

    queryset = FeeStructure.objects.select_related(
        "department",
        "course",
        "semester"
    )

    serializer_class = FeeStructureSerializer


class StudentFeeViewSet(viewsets.ModelViewSet):

    queryset = StudentFee.objects.select_related(
        "student",
        "fee_structure"
    )

    serializer_class = StudentFeeSerializer

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):

        total = StudentFee.objects.count()

        paid = StudentFee.objects.filter(status="Paid").count()

        partial = StudentFee.objects.filter(status="Partial").count()

        pending = StudentFee.objects.filter(status="Pending").count()

        collection = StudentFee.objects.aggregate(
            total=Sum("paid_amount")
        )["total"] or 0

        remaining = StudentFee.objects.aggregate(
            total=Sum("pending_amount")
        )["total"] or 0

        return Response({
            "students": total,
            "paid": paid,
            "partial": partial,
            "pending": pending,
            "collection": collection,
            "remaining": remaining,
        })


class PaymentViewSet(viewsets.ModelViewSet):

    queryset = Payment.objects.select_related(
        "student_fee"
    )

    serializer_class = PaymentSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payment = serializer.save()

        student_fee = payment.student_fee

        student_fee.paid_amount += payment.amount

        student_fee.save()

        return Response(
            {
                "message": "Payment successful.",
                "paid_amount": student_fee.paid_amount,
                "pending_amount": student_fee.pending_amount,
                "status": student_fee.status,
            },
            status=status.HTTP_201_CREATED
        )

    permission_classes = [
        IsAdmin
]