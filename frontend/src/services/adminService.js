const API_URL = import.meta.env.VITE_API_URL + '/api'

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats() {
    const response = await fetch(`${API_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Get all lectures with optional filters
  async getLectures(filters = {}) {
    let url = `${API_URL}/lectures` 
    
    // Add query parameters for filters if they exist
    const queryParams = new URLSearchParams()
    if (filters.classLevel) queryParams.append('class', filters.classLevel)
    if (filters.section) queryParams.append('section', filters.section)
    if (filters.subject) queryParams.append('subject', filters.subject)
    
    const queryString = queryParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Get all teachers with optional filters
  async getTeachers(filters = {}) {
    let url = `${API_URL}/admin/teachers`  // Changed from ${API_URL}/teachers
    
    // Add query parameters for filters if they exist
    const queryParams = new URLSearchParams()
    if (filters.subject) queryParams.append('subject', filters.subject)
    if (filters.teachesClass) queryParams.append('teachesClass', filters.teachesClass)
    if (filters.section) queryParams.append('section', filters.section)  // Add section filter if needed
    
    const queryString = queryParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Get all students with optional filters
  async getStudents(filters = {}) {
    let url = `${API_URL}/admin/students`
    
    // Add query parameters for filters if they exist
    const queryParams = new URLSearchParams()
    if (filters.classLevel) queryParams.append('classLevel', filters.classLevel)
    if (filters.section) queryParams.append('section', filters.section)
    
    const queryString = queryParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Get all payments
  async getPayments(filters = {}) {
    let url = `${API_URL}/payments`
    
    // Add query parameters for filters if they exist
    const queryParams = new URLSearchParams()
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.type) queryParams.append('type', filters.type)
    
    const queryString = queryParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Create a new lecture
  async createLecture(lectureData) {
    const response = await fetch(`${API_URL}/lectures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(lectureData)
    })
    return response.json()
  },

  // Update a lecture
  async updateLecture(lectureId, lectureData) {
    const response = await fetch(`${API_URL}/lectures/${lectureId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(lectureData)
    })
    return response.json()
  },

  // Delete a lecture
  async deleteLecture(lectureId) {
    const response = await fetch(`${API_URL}/lectures/${lectureId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Get student payments
  async getStudentPayments(studentId) {
    console.log(studentId,"studentId")
    const response = await fetch(`${API_URL}/payments/student/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Create student payment installment
  async createStudentPayment(studentId, paymentData) {
    const response = await fetch(`${API_URL}/payments/student/${studentId}/installment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(paymentData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create payment')
    }
    
    return response.json()
  },

  // Get teacher by ID
  async getTeacherById(teacherId) {
    const response = await fetch(`${API_URL}/teachers/payment/${teacherId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Get teacher payments
  async getTeacherPayments(teacherId) {
    const response = await fetch(`${API_URL}/payments/teacher/${teacherId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },
  

  // Get teacher lectures
  async getTeacherLectures(teacherId) {
    
    const response = await fetch(`${API_URL}/lectures/teacher/${teacherId}/admin`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  async getTeacherLecturesPayement(teacherId) {
    console.log(teacherId,"getTeacherLecturesPayement")
    const response = await fetch(`${API_URL}/lectures/teacher/${teacherId}/payments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Create teacher payment
  async createTeacherPayment(teacherId, paymentData) {
    const response = await fetch(`${API_URL}/payments/teacher/${teacherId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(paymentData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create payment')
    }
    
    return response.json()
  },
  
  // Register a new student (admin only)
  async registerStudent(studentData) {
    const response = await fetch(`${API_URL}/admin/register/student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(studentData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to register student')
    }
    
    return response.json()
  },
  
  // Register a new teacher (admin only)
  async registerTeacher(teacherData) {
    const response = await fetch(`${API_URL}/admin/register/teacher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(teacherData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to register teacher')
    }
    
    return response.json()
  },

  // Get student by ID
  async getStudentById(studentId) {
    const response = await fetch(`${API_URL}/students/direct/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },
  
  // Get student performance data
  async getStudentPerformance(studentId) {
    const response = await fetch(`${API_URL}/admin/student/${studentId}/performance`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },
  
  // Get student attendance data
  async getStudentAttendance(studentId) {
    const response = await fetch(`${API_URL}/admin/student/${studentId}/attendance`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },
  // Add after line 278
  async getStudentAttendanceDebug(studentId) {
    const response = await fetch(`${API_URL}/admin/student/${studentId}/attendance-debug`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },
}