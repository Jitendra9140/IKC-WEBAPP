import axios from 'axios';
import { showToast } from '../utils/toast';

// Create a custom event emitter for auth changes
const authEvents = {
  listeners: new Set(),
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  emit(data) {
    this.listeners.forEach(callback => callback(data));
  }
};

const API_URL = import.meta.env.VITE_API_URL + '/api/auth';

export const authService = {
  // Subscribe to auth changes
  onAuthChange(callback) {
    return authEvents.subscribe(callback);
  },
  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username, password
      });
      
      const data = response.data;
      
      // Store token and user ID
      localStorage.setItem('token', data.token);
      
      // Extract user ID from JWT token
      const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
      localStorage.setItem('userId', tokenPayload.user.id);
      localStorage.setItem('userRole', tokenPayload.user.role);
      
      // Notify subscribers about auth change
      authEvents.emit({ type: 'login', role: tokenPayload.user.role });
      
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
      
      // Notify subscribers about auth change
      authEvents.emit({ type: 'register', role: user.role });
  
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
    
    // Notify subscribers about auth change
    authEvents.emit({ type: 'logout' });
    
    showToast.info('You have been logged out');
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      
      if (!token || !userId || !userRole) {
        return null;
      }

      // For admin, we don't need to fetch additional data
      if (userRole === 'admin') {
        return {
          name: 'Administrator',
          role: 'admin'
        };
      }

      // For students and teachers, fetch their profile data
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/${userRole}s/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const userData = response.data;
        
        // Set default avatar based on role and gender
        let defaultImageUrl;
        if (userRole === 'student') {
          defaultImageUrl = userData.gender === 'female' ? 
            '/images/default-girl-student.png' : 
            '/images/default-boy-student.png';
        } else if (userRole === 'teacher') {
          defaultImageUrl = userData.gender === 'female' ? 
            '/images/default-woman-teacher.png' : 
            '/images/default-man-teacher.png';
        } else {
          defaultImageUrl = '/images/default-avatar.png';
        }
        
        return {
          ...userData,
          role: userRole,
          imageUrl: userData.imageUrl || defaultImageUrl
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }
};