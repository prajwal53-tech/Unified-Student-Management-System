import api from "./api";


export const getDashboard = async () => {
  const response = await api.get("student-fees/dashboard/");
  return response.data;
};