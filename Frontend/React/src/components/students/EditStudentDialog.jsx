import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

import { updateStudent } from "../../services/students";

function EditStudentDialog({
  student,
  refreshStudents,
}) {

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(student);

  useEffect(() => {

    setFormData(student);

  }, [student]);

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      await updateStudent(

        student.id,

        formData

      );

      alert("Student Updated");

      refreshStudents();

      setOpen(false);

    }

    catch (err) {

      console.log(err.response?.data);

      alert("Update Failed");

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <Dialog
      open={open}
      onOpenChange={setOpen}
    >

      <DialogTrigger asChild>

        <Button
          variant="outline"
          size="icon"
        >

          <Pencil className="h-4 w-4" />

        </Button>

      </DialogTrigger>

      <DialogContent>

        <DialogHeader>

          <DialogTitle>

            Edit Student

          </DialogTitle>

        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <Input

            name="roll_number"

            value={formData.roll_number || ""}

            onChange={handleChange}

            placeholder="Roll Number"

          />

          <Input

            name="enrollment_number"

            value={formData.enrollment_number || ""}

            onChange={handleChange}

            placeholder="Enrollment Number"

          />

          <Input

            name="admission_year"

            value={formData.admission_year || ""}

            onChange={handleChange}

            placeholder="Admission Year"

          />

          <Button
            className="w-full"
            disabled={loading}
          >

            {

              loading

              ?

              "Updating..."

              :

              "Update Student"

            }

          </Button>

        </form>

      </DialogContent>

    </Dialog>

  );

}

export default EditStudentDialog;