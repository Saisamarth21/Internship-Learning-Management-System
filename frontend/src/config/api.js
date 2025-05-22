// For development, use localhost, for production use the backend service name
const API_BASE_URL = import.meta.env.PROD 
  ? 'http://backend:4000'  // Using the service name from docker-compose
  : 'http://localhost:4000';

export default API_BASE_URL; 