const API_URL = import.meta.env.VITE_API_URL + '/api'

export const teacherService = {
  // Fetch teacher's profile
  async getProfile(teacherId) {
    const response = await fetch(`${API_URL}/teachers/${teacherId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    console.log('Response from getProfile:', response);
    return response.json()
  },

  // Fetch teacher's lectures
  async getLectures(teacherId) {
    const response = await fetch(`${API_URL}/lectures/teacher/${teacherId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Fetch teacher's students
  async getStudents(teacherId) {
    try {
      // Ensure teacherId is valid
      console.log('Fetching students for teacher ID:', teacherId);
      if (!teacherId) {
        console.error('Invalid teacher ID');
        throw new Error('Invalid teacher ID');
      }
      
      const response = await fetch(`${API_URL}/teachers/${teacherId}/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      return response.json()
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
  },

  // Create new lecture
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

  // Update teacher profile
  async updateProfile(teacherId, profileData) {
    const response = await fetch(`${API_URL}/teachers/${teacherId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(profileData)
    })
    return response.json()
  },

  // Get teacher's payments
  async getPayments(teacherId) {
    try {
      // Ensure teacherId is valid
      if (!teacherId) {
        console.error('Invalid teacher ID');
        throw new Error('Invalid teacher ID');
      }
      
      const response = await fetch(`${API_URL}/teachers/${teacherId}/payments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      return response.json()
    } catch (error) {
      console.error('Error in getPayments:', error);
      throw error;
    }
  },

  // Tests related methods
  async getTests(teacherId) {
    const response = await fetch(`${API_URL}/tests/teacher/${teacherId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  async createTest(testData) {
    const response = await fetch(`${API_URL}/tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(testData)
    })
    return response.json()
  },

  async updateTest(testId, testData) {
    const response = await fetch(`${API_URL}/tests/${testId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(testData)
    })
    return response.json()
  },

  async deleteTest(testId) {
    const response = await fetch(`${API_URL}/tests/${testId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // Marks related methods
  async getTestMarks(testId) {
    const response = await fetch(`${API_URL}/marks/test/${testId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    return response.json()
  },

  // async addOrUpdateMarks(marksData) {
  //   const response = await fetch(`${API_URL}/marks`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${localStorage.getItem('token')}`
  //     },
  //     body: JSON.stringify(marksData)
  //   })
  //   return response.json()
  // }, 
  async updateTestMarks(testId, studentMarks) {
    const response = await fetch(`${API_URL}/tests/${testId}/marks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ studentMarks })
    })
    return response.json()
  },

  async getAttendanceForLecture(lectureId) {
    try {
      const response = await fetch(`${API_URL}/attendance/lecture/${lectureId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 404) {
        // No attendance record exists yet
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch attendance`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },
  
  async saveAttendance(lectureId, records) {
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          lectureId,
          records
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: Failed to save attendance`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error saving attendance:', error);
      throw error;
    }
  }
}

// Add these methods to the teacherService object

