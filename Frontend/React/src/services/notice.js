import api from "./api";

export const getNotices = async () => {
  const response = await api.get("notices/");
  return response.data;
};