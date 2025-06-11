import { showToast } from '../utils/toast'

const API_URL = 'http://localhost:5000/api/auth'

export const authService = {
  async login(username, password, role) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, role })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.msg)
      
      // Store token and user ID
      localStorage.setItem('token', data.token)
      
      // Extract user ID from JWT token
      const tokenPayload = JSON.parse(atob(data.token.split('.')[1]))
      localStorage.setItem('userId', tokenPayload.user.id)
      localStorage.setItem('userRole', tokenPayload.user.role)
      
      showToast.success('Login successful!')
      return { ...data, role: tokenPayload.user.role }
    } catch (error) {
      showToast.error(error.message || 'Login failed')
      throw error
    }
  },

  async register(userData, role) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...userData, role })
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.msg || 'Registration failed');
  
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
      showToast.error(error.message || 'Registration failed');
      throw error;
    }
  },
  
  
  logout() {
    localStorage.removeItem('token')
    showToast.info('You have been logged out')
  }
}