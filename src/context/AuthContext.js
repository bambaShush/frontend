import React,{ createContext, useState } from "react";
import Cookies from "js-cookie";
import { isLoggedIn } from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(Cookies.get("userId"));
    const [token, setToken] = useState(Cookies.get("token"));

    const login = (userData) => {
        Cookies.set("userId", userData.userId, { expires: 7 });
        Cookies.set("token", userData.token, { expires: 7 });
        Cookies.set("firstName", userData.firstName, { expires: 7 });
        setUserId(userData.userId);
        setToken(userData.token);
    };

    const logout = () => {
        Cookies.remove("userId");
        Cookies.remove("token");
        Cookies.remove("firstName");
        setUserId(null);
        setToken(null);
    };

    const checkAuth = async () => {
        return await isLoggedIn(token);
    };

    return (
        <AuthContext.Provider value={{ userId, token, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

