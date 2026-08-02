import { createContext, useContext, useState, useEffect } from "react";
import { login as loginService, logout as logoutService, getMe } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("access");
        if (!token) return null;
        return {
            username: localStorage.getItem("username") || "Admin",
            role: localStorage.getItem("role") || "admin",
            email: localStorage.getItem("email") || "",
        };
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token && !user?.username) {
            getMe()
                .then((data) => {
                    setUser({
                        username: data.username,
                        role: data.role,
                        email: data.email,
                        firstName: data.first_name,
                        lastName: data.last_name,
                        phone: data.phone,
                    });
                })
                .catch(() => {
                    logoutService();
                    setUser(null);
                });
        }
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const data = await loginService(credentials);
            const userObj = {
                username: data.username,
                role: data.role || "admin",
                email: data.email || "",
            };
            setUser(userObj);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        logoutService();
        setUser(null);
    };

    const updateUserState = (updatedData) => {
        setUser((prev) => ({ ...prev, ...updatedData }));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                updateUserState,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}