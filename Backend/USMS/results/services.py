class GradeCalculator:

    @staticmethod
    def calculate(percentage):

        percentage = float(percentage)

        if percentage >= 90:
            return "A+", 10

        elif percentage >= 80:
            return "A", 9

        elif percentage >= 70:
            return "B+", 8

        elif percentage >= 60:
            return "B", 7

        elif percentage >= 50:
            return "C", 6

        elif percentage >= 40:
            return "D", 5

        return "F", 0

        


class GPACalculator:

    @staticmethod
    def calculate(student, semester):
        from .models import Result 

        results = Result.objects.filter(
            student=student,
            semester=semester
        )

        if not results.exists():
            return {
                "gpa": 0,
                "subjects": 0
            }

        total_points = 0

        for result in results:

            percentage = (
                float(result.marks_obtained)
                / result.exam_type.max_marks
            ) * 100

            _, grade_point = GradeCalculator.calculate(
                percentage
            )

            total_points += grade_point

        gpa = total_points / results.count()

        return {
            "gpa": round(gpa, 2),
            "subjects": results.count()
        }

class SemesterSummaryService:

    @staticmethod
    def get_summary(student, semester):

        from .models import Result

        results = Result.objects.filter(
            student=student,
            semester=semester
        ).select_related(
            "subject",
            "exam_type"
        )

        subjects = []

        overall_pass = True

        for result in results:

            data = result.calculate_result()

            if data["status"] == "FAIL":
                overall_pass = False

            subjects.append({
                "subject": result.subject.name,
                "exam": result.exam_type.name,
                "marks": float(result.marks_obtained),
                "percentage": data["percentage"],
                "grade": data["grade"],
                "grade_point": data["grade_point"]
            })

        gpa = GPACalculator.calculate(
            student,
            semester
        )["gpa"]

        return {
            "student": student.user.username,
            "semester": semester.number,
            "subjects": subjects,
            "gpa": gpa,
            "overall_status": "PASS" if overall_pass else "FAIL"
        }

class CGPACalculator:

    @staticmethod
    def calculate(student):

        from .models import Result

        semesters = (
            Result.objects.filter(student=student)
            .values_list("semester", flat=True)
            .distinct()
        )

        if not semesters:
            return {
                "cgpa": 0,
                "semesters": 0
            }

        total_gpa = 0

        for semester_id in semesters:

            semester = Result.objects.filter(
                student=student,
                semester=semester_id
            ).first().semester

            total_gpa += GPACalculator.calculate(
                student,
                semester
            )["gpa"]

        cgpa = total_gpa / len(semesters)

        return {
            "student": student.user.username,
            "cgpa": round(cgpa, 2),
            "semesters": len(semesters)
        }

from students.models import StudentProfile

class RankListService:

    @staticmethod
    def get_rank_list(semester):

        students = StudentProfile.objects.all()

        rank_list = []

        for student in students:

            gpa = GPACalculator.calculate(
                student,
                semester
            )["gpa"]

            rank_list.append({
                "student": student.user.username,
                "roll_number": student.roll_number,
                "gpa": gpa
            })

        rank_list.sort(
            key=lambda x: x["gpa"],
            reverse=True
        )

        for index, item in enumerate(rank_list, start=1):
            item["rank"] = index

        return rank_list

class TranscriptService:

    @staticmethod
    def generate(student):

        from .models import Result

        semesters = (
            Result.objects.filter(student=student)
            .values_list("semester", flat=True)
            .distinct()
        )

        transcript = []

        for semester_id in semesters:

            semester = Result.objects.filter(
                student=student,
                semester=semester_id
            ).first().semester

            summary = SemesterSummaryService.get_summary(
                student,
                semester
            )

            transcript.append(summary)

        cgpa = CGPACalculator.calculate(student)

        return {

            "student": {

                "name": student.user.username,

                "roll_number": student.roll_number,

                "enrollment_number": student.enrollment_number,

                "department": student.department.name,

                "course": student.course.name,
            },

            "semesters": transcript,

            "cgpa": cgpa["cgpa"]
        }