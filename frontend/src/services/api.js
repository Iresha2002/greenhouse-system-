import axios from 'axios';

// Base URL pointing to our Express backend
const API_URL = 'http://localhost:5000/api';

// 1. Fetch latest sensor reading
export const getLatestSensorReading = async () => {
    const response = await axios.get(`${API_URL}/sensors/latest`);
    return response.data;
};

// 2. Fetch all devices
export const getDevices = async () => {
    const response = await axios.get(`${API_URL}/devices`);
    return response.data;
};

// 3. Update device status/mode
export const updateDevice = async (id, data) => {
    const response = await axios.put(`${API_URL}/devices/${id}`, data);
    return response.data;
};

// 4.delete a device
export const deleteDevice = async (id) => {
    const response = await axios.delete(`${API_URL}/devices/${id}`);
    return response.data;
};



