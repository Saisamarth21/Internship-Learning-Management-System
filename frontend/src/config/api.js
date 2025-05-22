// For development, use localhost, for production use the backend service name
const API_BASE_URL = import.meta.env.PROD 
  ? 'http://localhost:4000'  // Browser needs to access via localhost
  : 'http://localhost:4000';

export default API_BASE_URL; 