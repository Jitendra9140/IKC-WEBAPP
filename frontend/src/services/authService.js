import axios from 'axios';
import { showToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL + '/api/auth';

export const authService = {
  async login(username, password, role) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username, password, role
      });
      
      const data = response.data;
      
      // Store token and user ID
      localStorage.setItem('token', data.token);
      
      // Extract user ID from JWT token
      const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
      localStorage.setItem('userId', tokenPayload.user.id);
      localStorage.setItem('userRole', tokenPayload.user.role);
      
      showToast.success('Login successful!');
      return { ...data, role: tokenPayload.user.role };
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Login failed';
      showToast.error(errorMessage);
      throw error;
    }
  },

  async register(userData, role) {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        ...userData, role
      });
  
      const data = response.data;
  
      // Store token
      localStorage.setItem('token', data.token);
  
      // Extract payload safely
      const tokenParts = data.token.split('.');
      if (tokenParts.length !== 3) throw new Error('Invalid token format');
  
      const payload = JSON.parse(atob(tokenParts[1]));
      const user = payload.user;
  
      if (!user?.id || !user?.role) {
        throw new Error('Token payload missing user info');
      }
  
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);
  
      showToast.success('Registration successful!');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Registration failed';
      showToast.error(errorMessage);
      throw error;
    }
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    showToast.info('You have been logged out');
  }
};