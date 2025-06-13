import api from './api';
import { showToast } from '../utils/toast';

export const teacherService = {
  // Fetch teacher's profile
  async getProfile(teacherId) {
    if (!teacherId) {
      showToast.error('User ID not found. Please log in again.');
      throw new Error('User ID not found');
    }
    
    try {
      console.log('Fetching profile for teacher ID:', teacherId);
      return await api.get(`/teachers/${teacherId}`);
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  // Fetch teacher's lectures
  async getLectures(teacherId) {
    if (!teacherId) {
      showToast.error('User ID not found. Please log in again.');
      throw new Error('User ID not found');
    }
    
    try {
      return await api.get(`/lectures/teacher/${teacherId}`);
    } catch (error) {
      console.error('Lectures fetch error:', error);
      throw error;
    }
  },

  // Fetch teacher's students
  async getStudents(teacherId) {
    try {
      // Ensure teacherId is valid
      console.log('Fetching students for teacher ID:', teacherId);
      if (!teacherId) {
        console.error('Invalid teacher ID');
        showToast.error('User ID not found. Please log in again.');
        throw new Error('Invalid teacher ID');
      }
      
      return await api.get(`/teachers/${teacherId}/students`);
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
  },

  // Create new lecture
  async createLecture(lectureData) {
    try {
      return await api.post('/lectures', lectureData);
    } catch (error) {
      console.error('Error creating lecture:', error);
      throw error;
    }
  },

  // Update teacher profile
  async updateProfile(teacherId, profileData) {
    try {
      return await api.put(`/teachers/${teacherId}`, profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get teacher's payments
  async getPayments(teacherId) {
    try {
      // Ensure teacherId is valid
      if (!teacherId) {
        console.error('Invalid teacher ID');
        showToast.error('User ID not found. Please log in again.');
        throw new Error('Invalid teacher ID');
      }
      
      return await api.get(`/teachers/${teacherId}/payments`);
    } catch (error) {
      console.error('Error in getPayments:', error);
      throw error;
    }
  },

  // Tests related methods
  async getTests(teacherId) {
    try {
      return await api.get(`/tests/teacher/${teacherId}`);
    } catch (error) {
      console.error('Error fetching tests:', error);
      throw error;
    }
  },

  async createTest(testData) {
    try {
      return await api.post('/tests', testData);
    } catch (error) {
      console.error('Error creating test:', error);
      throw error;
    }
  },

  async updateTest(testId, testData) {
    try {
      return await api.put(`/tests/${testId}`, testData);
    } catch (error) {
      console.error('Error updating test:', error);
      throw error;
    }
  },

  async deleteTest(testId) {
    try {
      return await api.delete(`/tests/${testId}`);
    } catch (error) {
      console.error('Error deleting test:', error);
      throw error;
    }
  },

  // Marks related methods
  async getTestMarks(testId) {
    try {
      return await api.get(`/marks/test/${testId}`);
    } catch (error) {
      console.error('Error fetching test marks:', error);
      throw error;
    }
  },

  async updateTestMarks(testId, studentMarks) {
    try {
      return await api.post(`/tests/${testId}/marks`, { studentMarks });
    } catch (error) {
      console.error('Error updating test marks:', error);
      throw error;
    }
  },

  async getAttendanceForLecture(lectureId) {
    try {
      try {
        return await api.get(`/attendance/lecture/${lectureId}`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // No attendance record exists yet
          return null;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },
  
  async saveAttendance(lectureId, records) {
    try {
      return await api.post('/attendance', {
        lectureId,
        records
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
      throw error;
    }
  }
}

