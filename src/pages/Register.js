import React, { useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import {AuthContext } from "../context/AuthContext";

const Register = ({setClientName}) => {
    const [firstname, setFirstname] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const authContext  = useContext(AuthContext);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null); 

    
        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstname, username, password }),
            });
            
            if (!response.ok) throw new Error(data.message || "Registration failed");
            const data = await response.json();
            setClientName(data.firstname);
            authContext.login(data);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

                {error && <p className="text-red-500 text-center mb-3">{error}</p>}

                <form onSubmit={handleSignUp}>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                        className="w-full p-2 border rounded mb-3"
                    />

                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full p-2 border rounded mb-3"
                    />

                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2 border rounded mb-3"
                    />

                    <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
                        Sign Up
                    </button>
                </form>

                <p className="text-center text-sm mt-3">
                    Already have an account? <a href="/login" className="text-blue-500">Log in</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
