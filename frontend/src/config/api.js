// Use the environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_URL environment variable is not set');
}

export default API_BASE_URL; 