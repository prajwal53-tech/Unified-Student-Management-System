import api from "./api";

export const getDepartments = async () => {
    const response = await api.get("departments/");
    return response.data;
};

export const getCourses = async () => {
    const response = await api.get("courses/");
    return response.data;
};

export const getSemesters = async () => {
    const response = await api.get("semesters/");
    return response.data;
};