import axios from 'axios';

// Determine the base URL based on the environment
const getBaseUrl = () => {
    // If we're in a browser environment
    if (typeof window !== 'undefined') {
        // Check if we're accessing through HTTPS domain
        if (window.location.protocol === 'https:') {
            // Use IP with port for API calls
            return 'http://140.238.250.199:4000/api';
        }
        // For direct IP access
        return 'http://140.238.250.199:4000/api';
    }
    // Fallback for server-side or development
    return 'http://backend:4000/api';
};

const api = axios.create({
    baseURL: getBaseUrl()
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle token expiration
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
    updatePassword: (data) => api.put('/profile/password', data)
};

export const userAPI = {
    getUsers: () => api.get('/users'),
    createUser: (data) => api.post('/users', data),
    updateUser: (userId, data) => api.put(`/users/${userId}`, data),
    deleteUser: (userId) => api.delete(`/users/${userId}`),
    exportUsers: () => api.get('/users/export'),
    importUsers: (data) => api.post('/users/import', data)
};

export default api; 