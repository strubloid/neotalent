// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  AUTH: {
    STATUS: `${API_BASE_URL}/api/auth/status`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    SEARCH_HISTORY: `${API_BASE_URL}/api/auth/search-history`,
  },
  CALORIES: `${API_BASE_URL}/api/calories`,
};

export default API_BASE_URL;
