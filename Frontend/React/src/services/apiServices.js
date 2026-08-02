import api from "./api";

// Departments API
export const getDepartments = async () => (await api.get("departments/")).data;
export const createDepartment = async (data) => (await api.post("departments/", data)).data;
export const updateDepartment = async (id, data) => (await api.put(`departments/${id}/`, data)).data;
export const deleteDepartment = async (id) => (await api.delete(`departments/${id}/`)).data;

// Courses API
export const getCourses = async () => (await api.get("courses/")).data;
export const createCourse = async (data) => (await api.post("courses/", data)).data;
export const updateCourse = async (id, data) => (await api.put(`courses/${id}/`, data)).data;
export const deleteCourse = async (id) => (await api.delete(`courses/${id}/`)).data;

// Semesters API
export const getSemesters = async () => (await api.get("semesters/")).data;
export const createSemester = async (data) => (await api.post("semesters/", data)).data;
export const updateSemester = async (id, data) => (await api.put(`semesters/${id}/`, data)).data;
export const deleteSemester = async (id) => (await api.delete(`semesters/${id}/`)).data;

// Subjects API
export const getSubjects = async () => (await api.get("subjects/")).data;
export const createSubject = async (data) => (await api.post("subjects/", data)).data;
export const updateSubject = async (id, data) => (await api.put(`subjects/${id}/`, data)).data;
export const deleteSubject = async (id) => (await api.delete(`subjects/${id}/`)).data;

// Faculty API
export const getFacultyList = async (params) => (await api.get("faculty/", { params })).data;
export const createFaculty = async (data) => (await api.post("faculty/", data)).data;
export const updateFaculty = async (id, data) => (await api.put(`faculty/${id}/`, data)).data;
export const deleteFaculty = async (id) => (await api.delete(`faculty/${id}/`)).data;

// Faculty Leaves API
export const getFacultyLeaves = async (params) => (await api.get("faculty-leaves/", { params })).data;
export const getMyFacultyLeaves = async () => (await api.get("faculty-leaves/me/")).data;
export const applyFacultyLeave = async (data) => (await api.post("faculty-leaves/me/", data)).data;
export const updateFacultyLeave = async (id, data) => (await api.put(`faculty-leaves/${id}/`, data)).data;

// Attendance API
export const getAttendanceSessions = async (params) => (await api.get("attendance-sessions/", { params })).data;
export const createAttendanceSession = async (data) => (await api.post("attendance-sessions/", data)).data;
export const getAttendanceRecords = async (params) => (await api.get("attendance/", { params })).data;
export const createAttendanceRecord = async (data) => (await api.post("attendance/", data)).data;
export const updateAttendanceRecord = async (id, data) => (await api.put(`attendance/${id}/`, data)).data;
export const getLowAttendanceDefaulters = async () => (await api.get("attendance/low-attendance/")).data;
export const bulkSaveAttendance = async (sessionData, records) => {
  const session = await createAttendanceSession(sessionData);
  const recordPromises = records.map((r) =>
    createAttendanceRecord({ ...r, session: session.id })
  );
  await Promise.all(recordPromises);
  return session;
};

// Student Productivity Extensions API
export const getStudentAdmitCard = async () => (await api.get("students/admit-card/")).data;
export const bulkPromoteStudents = async (data) => (await api.post("students/bulk-promote/", data)).data;

// Fees API
export const getFeeStructures = async () => (await api.get("fee-structures/")).data;
export const createFeeStructure = async (data) => (await api.post("fee-structures/", data)).data;
export const updateFeeStructure = async (id, data) => (await api.put(`fee-structures/${id}/`, data)).data;
export const deleteFeeStructure = async (id) => (await api.delete(`fee-structures/${id}/`)).data;

export const getStudentFees = async (params) => (await api.get("student-fees/", { params })).data;
export const createStudentFee = async (data) => (await api.post("student-fees/", data)).data;
export const updateStudentFee = async (id, data) => (await api.put(`student-fees/${id}/`, data)).data;

export const getPayments = async (params) => (await api.get("payments/", { params })).data;
export const createPayment = async (data) => (await api.post("payments/", data)).data;
export const getFeeDashboard = async () => (await api.get("student-fees/dashboard/")).data;

// Results & SPI / CGPA API
export const getExamTypes = async () => (await api.get("exam-types/")).data;
export const createExamType = async (data) => (await api.post("exam-types/", data)).data;
export const updateExamType = async (id, data) => (await api.put(`exam-types/${id}/`, data)).data;
export const deleteExamType = async (id) => (await api.delete(`exam-types/${id}/`)).data;

export const getResults = async (params) => (await api.get("results/", { params })).data;
export const createResult = async (data) => (await api.post("results/", data)).data;
export const updateResult = async (id, data) => (await api.put(`results/${id}/`, data)).data;
export const deleteResult = async (id) => (await api.delete(`results/${id}/`)).data;
export const getPerformanceBreakdown = async (studentId) => (await api.get("results/performance-breakdown/", { params: { student: studentId } })).data;

// Notices API
export const getNotices = async (params) => (await api.get("notices/", { params })).data;
export const createNotice = async (data) => (await api.post("notices/", data)).data;
export const updateNotice = async (id, data) => (await api.put(`notices/${id}/`, data)).data;
export const deleteNotice = async (id) => (await api.delete(`notices/${id}/`)).data;

// Timetable, Classrooms & Proxy Lectures API
export const getClassrooms = async () => (await api.get("classrooms/")).data;
export const createClassroom = async (data) => (await api.post("classrooms/", data)).data;
export const updateClassroom = async (id, data) => (await api.put(`classrooms/${id}/`, data)).data;
export const deleteClassroom = async (id) => (await api.delete(`classrooms/${id}/`)).data;

export const getTimetables = async (params) => (await api.get("timetable/", { params })).data;
export const getTimetable = getTimetables;
export const createTimetable = async (data) => (await api.post("timetable/", data)).data;
export const updateTimetable = async (id, data) => (await api.put(`timetable/${id}/`, data)).data;
export const deleteTimetable = async (id) => (await api.delete(`timetable/${id}/`)).data;

export const getProxyLectures = async (params) => (await api.get("proxy-lectures/", { params })).data;
export const getMyProxyLectures = async () => (await api.get("proxy-lectures/me/")).data;
export const createProxyLecture = async (data) => (await api.post("proxy-lectures/me/", data)).data;
export const updateProxyLecture = async (id, data) => (await api.put(`proxy-lectures/${id}/`, data)).data;
export const deleteProxyLecture = async (id) => (await api.delete(`proxy-lectures/${id}/`)).data;

// Student Information Form (SIF) API
export const getSIFList = async (params) => (await api.get("sif/", { params })).data;
export const getMySIF = async () => (await api.get("sif/me/")).data;
export const submitMySIF = async (data) => (await api.put("sif/me/", data)).data;
export const updateSIF = async (id, data) => (await api.put(`sif/${id}/`, data)).data;
