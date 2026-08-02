import api from "./api";

export const login = async (credentials) => {
  const response = await api.post("auth/login/", credentials);
  const data = response.data;

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("role", data.role || "admin");
  localStorage.setItem("username", data.username);
  localStorage.setItem("email", data.email || "");

  return data;
};

export const logout = () => {
  localStorage.clear();
};

export const getMe = async () => {
  const response = await api.get("auth/me/");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch("auth/me/", profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.post("auth/change-password/", passwordData);
  return response.data;
};
