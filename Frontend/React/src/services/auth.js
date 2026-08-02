import api from "./api";

export const login = async (credentials) => {

  const response = await api.post(
    "auth/login/",
    credentials
  );

  const data = response.data;

  localStorage.setItem(
    "access",
    data.access
  );

  localStorage.setItem(
    "refresh",
    data.refresh
  );

  localStorage.setItem(
    "role",
    data.role
  );

  localStorage.setItem(
    "username",
    data.username
  );

  localStorage.setItem(
    "email",
    data.email
  );

  return data;
};

export const logout = () => {

  localStorage.clear();

};
