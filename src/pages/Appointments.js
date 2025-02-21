import React, { useState, useContext, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { fetchAppointments, createAppointment, updateAppointment, generateDateTimes, deleteAppointment, getExistingDates } from "../services/appointmentsService";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css"; 
import { AuthContext } from "../context/AuthContext";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import "../styles/Appointments.css";


const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    
    const { token, userId, checkAuth } = useContext(AuthContext);
    const [existingAppointmentsDates, setExistingAppointmentsDates] = useState([]);

    const navigate = useNavigate();

    const getAppointments = async () => {
        try {
            const data = await fetchAppointments(token);
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        }
    };

    const getAppointmentsExistingDates = async () => {
        try {
            const data = await getExistingDates(token);
            setExistingAppointmentsDates(data);
        }catch (error) {
            console.error("Failed to fetch existing dates", error);
        }        
    }

    useEffect(() => {
        checkLoggedIn();
        getAppointments();
    }, [token]);

    useEffect(() => {
        getAppointmentsExistingDates();
    }, [appointments]);

    const checkLoggedIn = async () => {
        if(!(await checkAuth()))
            navigate("/login");
    }


    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [selectedDateTime, setSelectedDateTime] = useState("");
    const [updatedDateTime, setUpdatedDateTime] = useState("");

    
    const availableDateTimes = useMemo(() => {
       return generateDateTimes(existingAppointmentsDates);
    }, [existingAppointmentsDates]);

    const handleRowClick = (appointment) => {
        setUpdatedDateTime('');
        setSelectedAppointment(appointment);
        document.getElementById("overlay").style.display = "block"; 
    };

    const handleClosePopup = () => {
        setSelectedAppointment(null);
        document.getElementById("overlay").style.display = "none"; 
    };

    const updateAppointmentClick = async () => {
        await updateAppointment(token, selectedAppointment.id, updatedDateTime || availableDateTimes[0]);
        getAppointments();
        handleClosePopup();
    };
    const deleteAppointmentClick = async () => {
        await deleteAppointment(token, selectedAppointment.id);
        getAppointments();
        handleClosePopup();
    };

    const [nameFilter, setNameFilter] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const loggedUserId = Cookies.get("userId");

    const filteredAppointments = useMemo(() => {
       return appointments.filter(appt => {
            const matchesName = appt.userFirstName.toLowerCase().includes(nameFilter.toLowerCase());
            
            const apptDate = appt.appointmentDate; 
            const matchesDate =
                (!startDate || new Date(apptDate) >= startDate) &&
                (!endDate || new Date(apptDate) <= endDate);
            
            return matchesName && matchesDate;
        })
    }, [appointments, nameFilter, startDate, endDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!selectedDateTime)
            return;
        await createAppointment(token, selectedDateTime);
        setSelectedDateTime("");
        getAppointments();
    };

    return (
        <div className="appointments-container">
            
            <h2>Appointments</h2>

            <form onSubmit={handleSubmit} className="appointment-form">
                <h3>Add New Appointment</h3>
                 <Select
                    options={availableDateTimes.map((appointmentDate, index) => (
                        {value: appointmentDate, label: appointmentDate}
                    ))}
                    onChange={selectedDateOpt => {setSelectedDateTime(selectedDateOpt.value)} } 
                    placeholder="Select when..."
                    isSearchable
                />
                <button type="submit" className="submit-button">
                    Add Appointment
                </button>
            </form>
            <br/>
            <br/>
            
            {/* Filters */}
            <div className="appointments-filter">    
                <input
                    type="text"
                    placeholder="Filter by name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="date-picker"
                />

                <div>                
                    <label htmlFor="start-date">Start Date:</label>
                    <DatePicker
                    id="start-date"
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    placeholderText="Start Date"
                    className="w-1/3 p-2 border rounded"
                    format="yyyy-MM-dd"
                /></div>

                <div>
                <label htmlFor="end-date">End Date:</label>
                <DatePicker
                    id="end-date"
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    placeholderText="End Date"
                    className="date-picker"
                    format="yyyy-MM-dd"
                />
                </div>
            </div>

            {/* Appointments Table */}
            <div className="overflow-x-auto">
                <table className="appointments-table">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="px-4 py-2 text-left">First name</th>
                            <th className="px-4 py-2 text-left">Date & Time</th>
                        </tr>
                    </thead>
                    <tbody>
                    {filteredAppointments.length > 0 ? (
                            filteredAppointments.map(appt => (
                                <tr key={appt.id} onClick={() => handleRowClick(appt)} className="border-b">
                                    <td className="border px-4 py-2">{appt.userFirstName}</td>
                                    <td className="border px-4 py-2">{new Date(appt.appointmentDate).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center p-4 text-gray-500">No appointments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Popup */}
            <div id="overlay" className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center hidden">
                {selectedAppointment && (
                    <div className="popup-content">
                        <button onClick={handleClosePopup} className="popup-close-btn">
                            ✖
                        </button>

                        <h3 className="text-xl font-semibold mb-3">Appointment Details</h3>

                        <label className="popup-label">Name: {selectedAppointment.userFirstName}</label>
                        <br/>

                        <label className="popup-label">Date & Time: {new Date(selectedAppointment.appointmentDate).toLocaleString()}</label>

                        <br/>
                        <label className="popup-label">Created: {new Date(selectedAppointment.createdAt).toLocaleString()} </label>
                        <br/>
                        <label className="popup-label">Edit</label>
                        <select
                            value={updatedDateTime || selectedAppointment.appointmentDate}
                            onChange={(e) => {setUpdatedDateTime(e.target.value)}}
                            disabled={selectedAppointment.userId != userId}
                            
                            className="popup-select"
                        >
                            {availableDateTimes.map((appointmentDate, index) => (
                                <option key={index} value={appointmentDate}>{appointmentDate}</option>
                            ))}
                        </select>
                        <div className="popup-actions">
                        <button disabled={selectedAppointment.userId != userId} onClick={updateAppointmentClick} className="popup-button popup-save-btn">
                            Save
                        </button>
                        <br/>
                        <button disabled={selectedAppointment.userId != userId}  onClick={deleteAppointmentClick} className="popup-button popup-delete-btn">
                            Delete
                        </button>

                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={handleClosePopup} className="popup-button popup-close">
                                Close
                            </button>
                        </div>
                        </div>
                        
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
