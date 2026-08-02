import os
import django
from decimal import Decimal
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "USMS.settings")
django.setup()

from students.models import StudentProfile, StudentInformationForm

print("Seeding SIF Data...")

sif_samples = [
    {
        "roll": "ROLL-2024-001",
        "father": "Rajesh Sharma",
        "mother": "Sunita Sharma",
        "dob": date(2004, 5, 14),
        "gender": "Male",
        "blood": "B+",
        "category": "General",
        "aadhaar": "4521 8892 1023",
        "student_phone": "+91 98765 43210",
        "parent_phone": "+91 98123 45678",
        "perm_addr": "Flat 402, Sunshine Heights, M.G. Road",
        "curr_addr": "Hostel Block B, Room 204, Campus",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "bank": "State Bank of India",
        "acc": "38491029384",
        "ifsc": "SBIN0001234",
        "tenth": Decimal("89.50"),
        "twelfth": Decimal("87.20"),
        "school": "St. Xavier High School",
        "status": "Verified",
    },
    {
        "roll": "ROLL-2024-002",
        "father": "Sanjay Verma",
        "mother": "Kavita Verma",
        "dob": date(2004, 8, 22),
        "gender": "Male",
        "blood": "O+",
        "category": "OBC",
        "aadhaar": "5123 9012 3456",
        "student_phone": "+91 98222 11100",
        "parent_phone": "+91 98333 22211",
        "perm_addr": "House No 12, Civil Lines",
        "curr_addr": "Hostel Block B, Room 205, Campus",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411001",
        "bank": "HDFC Bank",
        "acc": "501002349102",
        "ifsc": "HDFC0000123",
        "tenth": Decimal("92.00"),
        "twelfth": Decimal("90.40"),
        "school": "Modern Public School",
        "status": "Submitted",
    },
    {
        "roll": "ROLL-2024-003",
        "father": "Ramesh Patel",
        "mother": "Geeta Patel",
        "dob": date(2004, 11, 3),
        "gender": "Female",
        "blood": "A+",
        "category": "General",
        "aadhaar": "6123 4567 8901",
        "student_phone": "+91 97111 22233",
        "parent_phone": "+91 97222 33344",
        "perm_addr": "15, Shanti Nagar, SG Highway",
        "curr_addr": "Girls Hostel, Room 102",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "pincode": "380015",
        "bank": "ICICI Bank",
        "acc": "002301928374",
        "ifsc": "ICIC0000456",
        "tenth": Decimal("94.80"),
        "twelfth": Decimal("93.50"),
        "school": "Delhi Public School",
        "status": "Verified",
    },
    {
        "roll": "ROLL-2024-004",
        "father": "Dipankar Sen",
        "mother": "Shrabani Sen",
        "dob": date(2003, 12, 19),
        "gender": "Female",
        "blood": "AB+",
        "category": "General",
        "aadhaar": "7890 1234 5678",
        "student_phone": "+91 96333 44455",
        "parent_phone": "+91 96444 55566",
        "perm_addr": "88, Salt Lake Sector 2",
        "curr_addr": "PG Accommodation, Tech Zone",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700091",
        "bank": "Axis Bank",
        "acc": "918020039485",
        "ifsc": "UTIB0000789",
        "tenth": Decimal("86.20"),
        "twelfth": Decimal("84.00"),
        "school": "South Point School",
        "status": "Submitted",
    },
    {
        "roll": "ROLL-2024-005",
        "father": "Anil Mehta",
        "mother": "Rekha Mehta",
        "dob": date(2004, 3, 30),
        "gender": "Male",
        "blood": "O-",
        "category": "EWS",
        "aadhaar": "8901 2345 6789",
        "student_phone": "+91 95555 66677",
        "parent_phone": "+91 95666 77788",
        "perm_addr": "204, Royal Apartments, Station Road",
        "curr_addr": "Hostel Block A, Room 108",
        "city": "Jaipur",
        "state": "Rajasthan",
        "pincode": "302001",
        "bank": "Punjab National Bank",
        "acc": "029300120039",
        "ifsc": "PUNB0001122",
        "tenth": Decimal("88.00"),
        "twelfth": Decimal("86.50"),
        "school": "Kendriya Vidyalaya",
        "status": "Draft",
    },
    {
        "roll": "ROLL-2024-006",
        "father": "Vijay Gupta",
        "mother": "Aarti Gupta",
        "dob": date(2004, 7, 10),
        "gender": "Female",
        "blood": "A-",
        "category": "SC",
        "aadhaar": "9012 3456 7890",
        "student_phone": "+91 94444 55566",
        "parent_phone": "+91 94555 66677",
        "perm_addr": "Plot 45, Vikas Nagar",
        "curr_addr": "Girls Hostel, Room 204",
        "city": "Lucknow",
        "state": "Uttar Pradesh",
        "pincode": "226001",
        "bank": "Bank of Baroda",
        "acc": "129401000293",
        "ifsc": "BARB0VIKASX",
        "tenth": Decimal("91.00"),
        "twelfth": Decimal("89.20"),
        "school": "City Montessori School",
        "status": "Verified",
    },
]

for sample in sif_samples:
    try:
        student = StudentProfile.objects.get(roll_number=sample["roll"])
        sif, _ = StudentInformationForm.objects.get_or_create(student=student)
        sif.father_name = sample["father"]
        sif.mother_name = sample["mother"]
        sif.date_of_birth = sample["dob"]
        sif.gender = sample["gender"]
        sif.blood_group = sample["blood"]
        sif.category = sample["category"]
        sif.aadhaar_number = sample["aadhaar"]
        sif.student_phone = sample["student_phone"]
        sif.parent_phone = sample["parent_phone"]
        sif.permanent_address = sample["perm_addr"]
        sif.current_address = sample["curr_addr"]
        sif.city = sample["city"]
        sif.state = sample["state"]
        sif.pincode = sample["pincode"]
        sif.bank_name = sample["bank"]
        sif.account_number = sample["acc"]
        sif.ifsc_code = sample["ifsc"]
        sif.tenth_percentage = sample["tenth"]
        sif.twelfth_percentage = sample["twelfth"]
        sif.previous_school_college = sample["school"]
        sif.status = sample["status"]
        sif.save()
        print(f"SIF Seeded for {student.user.username} ({sif.status})")
    except StudentProfile.DoesNotExist:
        print(f"Student with roll {sample['roll']} not found.")

print("All Dummy SIF Forms Seeded Successfully!")
