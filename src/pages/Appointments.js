import React, { useState, useContext, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { fetchAppointments, createAppointment, updateAppointment, generateDateTimes, deleteAppointment, getExistingDates } from "../services/appointmentsService";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css"; 
import { AuthContext } from "../context/AuthContext";
import Select from "react-select";
import { de } from "date-fns/locale";


const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    
    const { token, userId } = useContext(AuthContext);
    const [existingAppointmentsDates, setExistingAppointmentsDates] = useState([]);

    const getAppointments = async () => {
        try {
            const data = await fetchAppointments(token);
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        }
    };

    const getAppointmentsExistingDates = async () => {
        const data = await getExistingDates(token);
        setExistingAppointmentsDates(data);
    }

    useEffect(() => {
        getAppointments();
    }, [token]);

    useEffect(() => {
        getAppointmentsExistingDates();
    }, [appointments]);



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
        <div className="p-6">
            
            <h2 className="text-2xl font-bold mb-4">Appointments</h2>

            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white shadow-md rounded-lg max-w-md">
                <h3 className="text-lg font-semibold mb-3">Add New Appointment</h3>
                 <Select
                    options={availableDateTimes.map((appointmentDate, index) => (
                        {value: appointmentDate, label: appointmentDate}
                    ))}
                    onChange={selectedDateOpt => {setSelectedDateTime(selectedDateOpt.value)} } 
                    placeholder="Select when..."
                    isSearchable
                />
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-300 border border-blue-700">
                    Add Appointment
                </button>
            </form>
            <br/>
            <br/>
            
            {/* Filters */}
            <div className="mb-4 p-4 bg-white shadow-md rounded-lg flex gap-4">    
                <input
                    type="text"
                    placeholder="Filter by name"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="w-1/3 p-2 border rounded"
                />
                <label htmlFor="appointment-date" className="block text-gray-700 font-medium mb-2">
                Start Date:
                </label>
            
                <DatePicker
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    placeholderText="Start Date"
                    className="w-1/3 p-2 border rounded"
                    format="yyyy-MM-dd"
                />
                <label htmlFor="appointment-date" className="block text-gray-700 font-medium mb-2">
                End Date:
                </label>
                <DatePicker
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    placeholderText="End Date"
                    className="w-1/3 p-2 border rounded"
                    format="yyyy-MM-dd"
                />
            </div>

            {/* Appointments Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 shadow-lg rounded-lg">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="px-4 py-2 text-left">Dog Name</th>
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
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                        <button onClick={handleClosePopup} className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg">
                            ✖
                        </button>

                        <h3 className="text-xl font-semibold mb-3 text-center">Appointment Details</h3>

                        <label className="block text-sm font-medium text-gray-700">Name: {selectedAppointment.userFirstName}</label>
                        <br/>

                        <label className="block text-sm font-medium text-gray-700">Date & Time: {new Date(selectedAppointment.appointmentDate).toLocaleString()}</label>

                        <br/>
                        <label className="block text-sm font-medium text-gray-700">Created: {new Date(selectedAppointment.createdAt).toLocaleString()} </label>
                        <br/>
                        <label className="block text-sm font-medium text-gray-700">Edit</label>
                        <select
                            value={updatedDateTime || selectedAppointment.appointmentDate}
                            onChange={(e) => {setUpdatedDateTime(e.target.value)}}
                            disabled={selectedAppointment.userId != userId}
                            
                            className="w-full p-2 border rounded mb-3"
                        >
                            {availableDateTimes.map((appointmentDate, index) => (
                                <option key={index} value={appointmentDate}>{appointmentDate}</option>
                            ))}
                        </select>
                        <br/>
                        <button disabled={selectedAppointment.userId != userId} onClick={updateAppointmentClick} className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg ">
                            Save
                        </button>
                        <br/>
                        <button disabled={selectedAppointment.userId != userId}  onClick={deleteAppointmentClick} className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg">
                            Delete
                        </button>

                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={handleClosePopup} className="px-4 py-2 bg-gray-400 text-white rounded">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
