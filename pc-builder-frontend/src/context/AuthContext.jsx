// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Stores user object {id, username} and checks if logged in
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Check for token on component mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Optional: Verify token by hitting a protected endpoint like /users/me
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    // 2. Fetch user details (optional, but confirms the token is valid)
    const fetchUser = async () => {
        try {
            // Call the protected endpoint defined in your FastAPI main.py
            const response = await apiClient.get('/users/me');
            // The response data contains the user's ID and username from the JWT payload
            setUser(response.data);
        } catch (error) {
            // Token invalid or expired
            console.error("Failed to fetch user details:", error);
            localStorage.removeItem('accessToken');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    // 3. Login function
    const login = async (username, password) => {
        setIsLoading(true);
        try {
            // FastAPI's /auth/login endpoint requires FormData, not JSON
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            // Note: The login route is at /auth/login, not /api/v1/auth/login, so use the full path
            const response = await apiClient.post('/auth/login', formData, {
                 baseURL: 'http://127.0.0.1:8000', // Override to hit the /auth prefix correctly
                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' } // Required for OAuth2
            });

            const { access_token } = response.data;
            localStorage.setItem('accessToken', access_token);
            await fetchUser(); // Fetch user details immediately after receiving the token
            return true;
        } catch (error) {
            console.error('Login failed:', error.response?.data?.detail || error.message);
            setIsLoading(false);
            throw error; // Propagate error for UI display
        }
    };

    // 4. Logout function
    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        // Redirect to login page
        window.location.href = '/login';
    };

    const value = { user, isLoading, login, logout, isAuthenticated: !!user };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};