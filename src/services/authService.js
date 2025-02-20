import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/auth";

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password, firstName: ""});

    return response.data;
};


export const register = async (username, password) => {
    const response = await axios.post(`${API_URL}/register`, { username, password });
    return response.data;
};

export const isLoggedIn = async (token) => {
    try {
        debugger;
        return await axios.get(`${API_URL}/is-logged-in-user`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        return false;
    }
};


