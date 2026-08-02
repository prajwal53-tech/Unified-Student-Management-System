from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet


class TranscriptPDF:

    @staticmethod
    def generate(student_data):

        filename = f"transcript_{student_data['student']['roll_number']}.pdf"

        doc = SimpleDocTemplate(filename)

        styles = getSampleStyleSheet()

        elements = []

        elements.append(
            Paragraph(
                "<b>LJ UNIVERSITY</b>",
                styles["Title"]
            )
        )

        elements.append(
            Paragraph(
                "Official Academic Transcript",
                styles["Heading2"]
            )
        )

        student = student_data["student"]

        elements.append(
            Paragraph(
                f"Student : {student['name']}",
                styles["Normal"]
            )
        )

        elements.append(
            Paragraph(
                f"Roll No : {student['roll_number']}",
                styles["Normal"]
            )
        )

        elements.append(
            Paragraph(
                f"Enrollment : {student['enrollment_number']}",
                styles["Normal"]
            )
        )

        elements.append(
            Paragraph(
                f"Department : {student['department']}",
                styles["Normal"]
            )
        )

        elements.append(
            Paragraph(
                f"Course : {student['course']}",
                styles["Normal"]
            )
        )

        elements.append(
            Paragraph("<br/><br/>", styles["Normal"])
        )

        for semester in student_data["semesters"]:

            elements.append(
                Paragraph(
                    f"<b>Semester {semester['semester']}</b>",
                    styles["Heading2"]
                )
            )

            data = [
                [
                    "Subject",
                    "Exam",
                    "Marks",
                    "Grade",
                    "Grade Point"
                ]
            ]

            for subject in semester["subjects"]:

                data.append([
                    subject["subject"],
                    subject["exam"],
                    subject["marks"],
                    subject["grade"],
                    subject["grade_point"]
                ])

            table = Table(data)

            table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ])
            )

            elements.append(table)

            elements.append(
                Paragraph(
                    f"GPA : {semester['gpa']}",
                    styles["Normal"]
                )
            )

            elements.append(
                Paragraph("<br/>", styles["Normal"])
            )

        elements.append(
            Paragraph(
                f"<b>Final CGPA : {student_data['cgpa']}</b>",
                styles["Heading1"]
            )
        )

        doc.build(elements)

        return filename