import React,{ useState } from "react";
import './App.css';

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Appointments from "./pages/Appointments";
import Cookies from "js-cookie";



function App() {
  const [clientName, setClientName] = useState(Cookies.get("firstName"));
  
  const token = Cookies.get("token");

    const handleLogout = () => {
        Cookies.remove("firstName");
        Cookies.remove("token");
        Cookies.remove("userId");
        window.location.href = "/login"; 
    };

  return (
      <AuthProvider>
          <Router>
          <nav className="bg-gray-800 p-4 flex justify-between items-center text-white">
                <div>
                    <Link to="/" className="text-lg font-bold">Dog Grooming App</Link>
                </div>
                <div className="flex items-center space-x-4">
                    {clientName && <span>Welcome, {clientName}!</span>} 
                    {clientName && <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">Logout</button>}
                </div>
            </nav>
              <Routes>
                  <Route path="/" element={<Appointments />} />
                  <Route path="/login" element={<Login setClientName={setClientName} />} />
                  <Route path="/register" element={<Register setClientName={setClientName} />} />
                  <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
              </Routes>
          </Router>
      </AuthProvider>
  );
}

export default App;
