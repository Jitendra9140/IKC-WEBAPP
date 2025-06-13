import api from './api';
import { showToast } from '../utils/toast';

const API_URL = import.meta.env.VITE_API_URL + '/api';

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats() {
    return await api.get('/admin/dashboard');
  },

  // Get all lectures with optional filters
  async getLectures(filters = {}) {
    const { date, teacherId, classLevel, section } = filters;
    let url = '/lectures';
    
    // Add query parameters if filters are provided
    const params = {};
    if (date) params.date = date;
    if (teacherId) params.teacherId = teacherId;
    if (classLevel) params.class = classLevel;
    if (section) params.section = section;
    
    return await api.get(url, { params });
  },

  // Get all teachers
  async getTeachers() {
    return await api.get('/teachers');
  },

  // Get all students with optional filters
  async getStudents(filters = {}) {
    const { classLevel, section } = filters;
    let url = '/students';
    
    // Add query parameters if filters are provided
    const params = {};
    if (classLevel) params.class = classLevel;
    if (section) params.section = section;
    
    return await api.get(url, { params });
  },

  // Get all payments
  async getPayments() {
    return await api.get('/payments');
  },

  // Create a new lecture
  async createLecture(lectureData) {
    return await api.post('/lectures', lectureData);
  },

  // Update a lecture
  async updateLecture(lectureId, lectureData) {
    return await api.put(`/lectures/${lectureId}`, lectureData);
  },

  // Delete a lecture
  async deleteLecture(lectureId) {
    return await api.delete(`/lectures/${lectureId}`);
  },

  // Get student payments
  async getStudentPayments(studentId) {
    console.log(studentId, "studentId");
    return await api.get(`/payments/student/${studentId}`);
  },

  // Create student payment installment
  async createStudentPayment(studentId, paymentData) {
    try {
      return await api.post(`/payments/student/${studentId}/installment`, paymentData);
    } catch (error) {
      throw error;
    }
  },

  // Get teacher by ID
  async getTeacherById(teacherId) {
    return await api.get(`/teachers/payment/${teacherId}`);
  },

  // Get teacher payments
  async getTeacherPayments(teacherId) {
    return await api.get(`/payments/teacher/${teacherId}`);
  },
  
  // Get teacher lectures
  async getTeacherLectures(teacherId) {
    return await api.get(`/lectures/teacher/${teacherId}/admin`);
  },

  async getTeacherLecturesPayement(teacherId) {
    console.log(teacherId, "getTeacherLecturesPayement");
    return await api.get(`/lectures/teacher/${teacherId}/payments`);
  },

  // Create teacher payment
  async createTeacherPayment(teacherId, paymentData) {
    try {
      return await api.post(`/payments/teacher/${teacherId}`, paymentData);
    } catch (error) {
      throw error;
    }
  },
  
  // Register a new student (admin only)
  async registerStudent(studentData) {
    try {
      return await api.post('/admin/register/student', studentData);
    } catch (error) {
      throw error;
    }
  },
  
  // Register a new teacher (admin only)
  async registerTeacher(teacherData) {
    try {
      return await api.post('/admin/register/teacher', teacherData);
    } catch (error) {
      throw error;
    }
  },

  // Get student by ID
  async getStudentById(studentId) {
    return await api.get(`/students/direct/${studentId}`);
  },
  
  // Get student performance data
  async getStudentPerformance(studentId) {
    return await api.get(`/admin/student/${studentId}/performance`);
  },
  
  // Get student attendance data
  async getStudentAttendance(studentId) {
    return await api.get(`/admin/student/${studentId}/attendance`);
  },

  // Get student attendance debug data
  async getStudentAttendanceDebug(studentId) {
    return await api.get(`/admin/student/${studentId}/attendance-debug`);
  },
}