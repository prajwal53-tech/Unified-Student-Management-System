from rest_framework import viewsets, status
from django.db import transaction
from django.db.models import Sum
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

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
    permission_classes = [IsAuthenticated]


class StudentFeeViewSet(viewsets.ModelViewSet):
    queryset = StudentFee.objects.select_related(
        "student__user",
        "fee_structure"
    )
    serializer_class = StudentFeeSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Enforce Rule: Only students can make fee payments for their semester
        user_role = getattr(request.user, "role", "")
        if user_role != "student":
            return Response(
                {"detail": "Only students can perform fee payments for their respective semesters. Administrators and faculty have read-only status access."},
                status=status.HTTP_403_FORBIDDEN
            )

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