import axios from 'axios';

// Determine the base URL based on the environment
const getBaseUrl = () => {
    // If we're in a browser environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // If accessing through domain
        if (hostname === 'lms.saisamarth.duckdns.org') {
            // Use the current server's IP for API calls when accessed through domain
            return `http://${window.location.hostname}:4000/api`;
        }
        
        // If accessing through IP
        if (hostname === '140.238.250.199' || hostname === '129.154.250.255') {
            return `http://${hostname}:4000/api`;
        }
        
        // For localhost
        return 'http://localhost:4000/api';
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

export const courseAPI = {
    getCourses: () => api.get('/courses'),
    createCourse: (data) => {
        if (data instanceof FormData) {
            return api.post('/courses', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        return api.post('/courses', data);
    },
    updateCourse: (courseId, data) => {
        if (data instanceof FormData) {
            return api.put(`/courses/${courseId}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        return api.put(`/courses/${courseId}`, data);
    },
    deleteCourse: (courseId) => api.delete(`/courses/${courseId}`)
};

export const videoAPI = {
    getVideos: (courseId) => api.get(`/videos/course/${courseId}`),
    createVideo: (courseId, data) => {
        if (data instanceof FormData) {
            return api.post(`/videos/course/${courseId}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        return api.post(`/videos/course/${courseId}`, data);
    },
    updateVideo: (videoId, data) => {
        if (data instanceof FormData) {
            return api.put(`/videos/${videoId}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        return api.put(`/videos/${videoId}`, data);
    },
    deleteVideo: (videoId) => api.delete(`/videos/${videoId}`)
};

export default api; 