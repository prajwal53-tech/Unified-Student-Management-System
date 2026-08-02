import { createContext, useContext, useState } from "react";
import { login as loginService, logout as logoutService } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState({
        username: localStorage.getItem("username"),
        role: localStorage.getItem("role"),
        email: localStorage.getItem("email"),
    });
const login = async (credentials) => {
  const data = await loginService(credentials);

  setUser({
    username: data.username,
    role: data.role,
    email: data.email,
  });

  return data;
};

    const logout = () => {

        logoutService();

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}