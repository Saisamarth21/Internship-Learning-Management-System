// For development, use localhost, for production use the backend service name
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default API_BASE_URL; 