import api from './api';
import { showToast } from '../utils/toast';

export const studentService = {
  // Fetch student's profile
  async getProfile(studentId) {
    if (!studentId) {
      showToast.error('User ID not found. Please log in again.');
      throw new Error('User ID not found');
    }
    
    try {
      console.log(`Fetching profile for student ${studentId}`);
      return await api.get(`/students/${studentId}`);
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  // Fetch student's schedule (lectures based on class and section)
  async getSchedule(studentId) {
    if (!studentId) {
      showToast.error('User ID not found. Please log in again.');
      throw new Error('User ID not found');
    }
    
    try {
      // First get the student profile to determine class and section
      const studentProfile = await this.getProfile(studentId);
      
      // Then fetch lectures for that class and section
      const lectures = await api.get(`/students/${studentId}/lectures`);
      
      // Fetch upcoming tests for the student's class and section
      let tests = [];
      try {
        tests = await api.get(`/tests/class/${studentProfile.class}/section/${studentProfile.section}`);
      } catch (error) {
        console.error('Failed to fetch tests:', error);
      }
      
      // Return profile, lectures and tests
      return {
        profile: studentProfile,
        lectures: lectures,
        tests: tests
      };
    } catch (error) {
      console.error('Schedule fetch error:', error);
      throw error;
    }
  },

  // Fetch student's test marks
  async getMarks(studentId) {
    if (!studentId) {
      showToast.error('User ID not found. Please log in again.');
      throw new Error('User ID not found');
    }
    
    try {
      return await api.get(`/students/${studentId}/marks`);
    } catch (error) {
      console.error('Marks fetch error:', error);
      throw error;
    }
  },
  
  // Fetch student's payment details
  async getPayments(studentId) {
    if (!studentId) {
      showToast.error('User ID not found. Please log in again.');
      throw new Error('User ID not found');
    }
    
    try {
      console.log(`Fetching payments for student ${studentId}`);
      return await api.get(`/payments/personalstudent/${studentId}`);
    } catch (error) {
      console.error('Payments fetch error:', error);
      throw error;
    }
  }
};