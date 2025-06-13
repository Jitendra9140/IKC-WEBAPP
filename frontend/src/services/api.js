import axios from 'axios';
import { showToast } from '../utils/toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;
    
    if (response && response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      showToast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else if (response) {
      // Handle other errors
      const errorMessage = response.data?.message || response.data?.msg || 'Something went wrong';
      showToast.error(errorMessage);
    } else {
      // Network error or other issues
      showToast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;