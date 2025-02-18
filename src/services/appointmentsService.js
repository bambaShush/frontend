import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/appointment";

export const fetchAppointments = async (token) => {

    try {
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.error("Invalid credentials. Please try again");
            window.location.href = "/login"; 
        } else {
            console.error("An error occurred. Please try again later");
        }
    }

};


export const createAppointment = async (token, appointmentDate) => {
    appointmentDate = formatClientAppointmentDate(appointmentDate);
    const response = await axios.post(API_URL, {Id: 0, UserFirstName: "",AppointmentDate: appointmentDate, CreatedAt: new Date().toISOString() },{
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}


export const updateAppointment = async (token, Id, appointmentDate) => {
    appointmentDate = formatClientAppointmentDate(appointmentDate);
    const response = await axios.put(API_URL, {Id, UserFirstName: "", AppointmentDate: new Date(appointmentDate).toISOString(), CreatedAt: new Date().toISOString() },{
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export const deleteAppointment = async (token, Id) => {
    const response = await axios.delete(`${API_URL}/${Id}` ,{
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

 const formatClientAppointmentDate = (AppointmentDate) => {
    const date = new Date(AppointmentDate).toISOString()
    const localTime = new Date(AppointmentDate).toLocaleTimeString(); // Get local time string
    return date.split('T')[0] + 'T' + localTime;
};

export const getExistingDates = async (token) => {
    const response = await axios.get(`${API_URL}/existingDates`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const generateDateTimes = (existingAppointments) => {
        const now = new Date();
        const dateTimes = [];
        const existingRanges = existingAppointments.map(appt => {
            const start = new Date(appt);
            const end = new Date(start);
            end.setHours(start.getHours() + 2); 
            return { start, end };
        });
    
        let futureDate = new Date(now);
        futureDate.setHours(futureDate.getHours() + 2,0,0,0); 
        
        while (dateTimes.length < 50) {
            const year = futureDate.getFullYear();
            const month = String(futureDate.getMonth() + 1).padStart(2, "0");
            const day = String(futureDate.getDate()).padStart(2, "0");
            const hours = String(futureDate.getHours()).padStart(2, "0");
            const minutes = String(futureDate.getMinutes()).padStart(2, "0");
    
            const dateTimeStr = `${year}-${month}-${day} ${hours}:${minutes}`;
    
            
            const isOverlapping = existingRanges.some(({ start, end }) => {
                return futureDate >= start && futureDate < end; //if Overlaps
            });

            if(futureDate.getHours() < 8) {
                futureDate.setHours(futureDate.getHours() + 2);
                continue;
            }else if (futureDate.getHours() >= 20) {
                futureDate.setDate(futureDate.getDate() + 1);
                futureDate.setHours(8, 0, 0, 0);
            }

            if (!isOverlapping) {
                dateTimes.push(dateTimeStr);
            }
    
            futureDate.setHours(futureDate.getHours() + 2);
            
        }
    
        return dateTimes;
    };