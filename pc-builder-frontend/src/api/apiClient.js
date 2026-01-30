// src/api/apiClient.js
import axios from 'axios';

// 1. Define the base URL for your FastAPI backend
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1'; // Note: /api/v1 prefix from your router setup

// 2. Create the Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 3. Request Interceptor (CRITICAL for JWT)
// This runs before every request is sent.
apiClient.interceptors.request.use(
    (config) => {
        // Get the token from local storage
        const token = localStorage.getItem('accessToken');

        // If the token exists, attach it to the Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 4. Response Interceptor (Optional but good for token expiration)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Example: If token expires, redirect to login
        if (error.response && error.response.status === 401) {
            // Clear invalid token and redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            console.error("Authentication failed or token expired.");
        }
        return Promise.reject(error);
    }
);

export default apiClient;