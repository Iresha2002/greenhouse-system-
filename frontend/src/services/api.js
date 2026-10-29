import axios from 'axios';

// Base URL pointing to our Express backend
const API_URL = 'http://localhost:5001/api';

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


// 5. User Registration
export const registerUser = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
};

// 6. User Login
export const loginUser = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};

// Helper for authenticated requests
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// 7. Crop Products Marketplace APIs
export const getProducts = async (params = {}) => {
    const response = await axios.get(`${API_URL}/products`, { params });
    return response.data;
};

export const getProductById = async (id) => {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
};

export const getMyProducts = async () => {
    const response = await axios.get(`${API_URL}/products/farmer/my-products`, getAuthHeaders());
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await axios.post(`${API_URL}/products`, productData, getAuthHeaders());
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await axios.put(`${API_URL}/products/${id}`, productData, getAuthHeaders());
    return response.data;
};

export const toggleProductStatus = async (id, status) => {
    const response = await axios.patch(`${API_URL}/products/${id}/status`, { status }, getAuthHeaders());
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await axios.delete(`${API_URL}/products/${id}`, getAuthHeaders());
    return response.data;
};

export const updateProductStock = async (id, quantity) => {
    const response = await axios.patch(`${API_URL}/products/${id}/stock`, { quantity }, getAuthHeaders());
    return response.data;
};

// 8. Shopping Cart APIs (Server-Side Price Verification & Stock Guard)
export const calculateCart = async (items, deliveryMethod = 'delivery') => {
    const response = await axios.post(`${API_URL}/cart/calculate`, { items, deliveryMethod });
    return response.data;
};

// 9. Order Management APIs
export const createOrder = async (orderData) => {
    const response = await axios.post(`${API_URL}/orders`, orderData, getAuthHeaders());
    return response.data;
};

export const getMyOrders = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}/orders/my-orders?${query}` : `${API_URL}/orders/my-orders`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await axios.get(`${API_URL}/orders/${id}`, getAuthHeaders());
    return response.data;
};

export const cancelOrder = async (id, reason) => {
    const response = await axios.patch(`${API_URL}/orders/${id}/cancel`, { reason }, getAuthHeaders());
    return response.data;
};





// 10. Farmer Fulfillment & Lifecycle APIs
export const getFarmerOrders = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}/orders/farmer/my-orders?${query}` : `${API_URL}/orders/farmer/my-orders`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
};

export const updateFarmerOrderStatus = async (id, data) => {
    const response = await axios.patch(`${API_URL}/orders/${id}/farmer-status`, data, getAuthHeaders());
    return response.data;
};

// 11. Agricultural Supplies Marketplace Public APIs
export const getSupplyProducts = async (params = {}) => {
    const response = await axios.get(`${API_URL}/supplies`, { params });
    return response.data;
};

export const getSupplyProductById = async (id) => {
    const response = await axios.get(`${API_URL}/supplies/${id}`);
    return response.data;
};

export const getSupplyCategories = async () => {
    const response = await axios.get(`${API_URL}/supplies/categories`);
    return response.data;
};

export const getSupplyFacets = async () => {
    const response = await axios.get(`${API_URL}/supplies/facets`);
    return response.data;
};

// 12. Supplier Portal Product Management APIs (Protected - Supplier Role Only)
export const getMySupplyProducts = async () => {
    const response = await axios.get(`${API_URL}/supplies/supplier/my-supplies`, getAuthHeaders());
    return response.data;
};

export const createSupplyProduct = async (supplyData) => {
    const response = await axios.post(`${API_URL}/supplies`, supplyData, getAuthHeaders());
    return response.data;
};

export const updateSupplyProduct = async (id, supplyData) => {
    const response = await axios.put(`${API_URL}/supplies/${id}`, supplyData, getAuthHeaders());
    return response.data;
};

export const toggleSupplyProductStatus = async (id, status) => {
    const response = await axios.patch(`${API_URL}/supplies/${id}/status`, { status }, getAuthHeaders());
    return response.data;
};

export const deleteSupplyProduct = async (id) => {
    const response = await axios.delete(`${API_URL}/supplies/${id}`, getAuthHeaders());
    return response.data;
};

export const updateSupplyProductStock = async (id, stockPayload) => {
    const body = typeof stockPayload === 'number' ? { quantity: stockPayload } : stockPayload;
    const response = await axios.patch(`${API_URL}/supplies/${id}/stock`, body, getAuthHeaders());
    return response.data;
};

// 13. Agricultural Supplies Cart Validation API
export const calculateSuppliesCart = async (items, deliveryMethod = 'delivery') => {
    const response = await axios.post(`${API_URL}/cart/calculate-supplies`, { items, deliveryMethod });
    return response.data;
};
