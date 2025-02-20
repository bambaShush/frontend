import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import {AuthContext } from "../context/AuthContext";

const Login = ({setClientName}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const authContext  = useContext(AuthContext);


    const navigate = useNavigate();
    
    useEffect(() => {
        checkauth();
    }, [navigate, authContext]);

    const checkauth = async () => {
        if (authContext.userId) {
           if(!(await authContext.checkAuth()))
            navigate("/login");
        }
    };

    if (!authContext) {
        console.error("AuthContext is undefined");
        return <div>Error</div>;
    }
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await login(username, password);
            setClientName(userData.firstName);
            authContext.login(userData); 
            navigate("/appointments"); // Redirect to Dashboard
        } catch (error) {
            alert("Invalid credentials");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {<form onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-300 border border-blue-700">Login</button>
            </form>}
            <p className="text-center text-sm mt-3">
                    Don't have an account? <a href="/register" className="text-blue-500">Sign up</a>
            </p>
        </div>
    );
};

export default Login;
