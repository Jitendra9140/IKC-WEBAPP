import axios from 'axios';
import { showToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL + '/api/admin';

export const adminCredentialsService = {
  // Get admin username
  async getAdminUsername() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/credentials`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.username;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch admin username';
      showToast.error(errorMessage);
      throw error;
    }
  },

  // Update admin credentials
  async updateCredentials(currentPassword, newUsername, newPassword) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const data = {
        currentPassword
      };

      // Only include fields that are being updated
      if (newUsername) {
        data.newUsername = newUsername;
      }

      if (newPassword) {
        data.newPassword = newPassword;
      }

      const response = await axios.post(`${API_URL}/update-credentials`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      showToast.success('Admin credentials updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update admin credentials';
      showToast.error(errorMessage);
      throw error;
    }
  }
};