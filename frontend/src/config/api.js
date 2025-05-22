// For development, use localhost, for production use the VPS IP
const API_BASE_URL = import.meta.env.PROD 
  ? 'http://your-vps-ip:4000'  // Replace with your actual VPS IP
  : 'http://localhost:4000';

export default API_BASE_URL; 