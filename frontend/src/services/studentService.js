const API_URL = import.meta.env.VITE_API_URL + '/api'

export const studentService = {
  // Fetch student's profile
  async getProfile(studentId) {
    const token = localStorage.getItem('token') || '';
    console.log(`Fetching profile for student ${studentId}`)
    const response = await fetch(`${API_URL}/students/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: Failed to fetch profile`);
    }
    
    return response.json()
  },

  // Fetch student's schedule (lectures based on class and section)
  async getSchedule(studentId) {
    try {
      // First get the student profile to determine class and section
      const studentProfile = await this.getProfile(studentId);
      
      // Then fetch lectures for that class and section
      const response = await fetch(`${API_URL}/students/${studentId}/lectures`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: Failed to fetch lectures`);
      }
      
      const lectures = await response.json();
      
      // Fetch upcoming tests for the student's class and section
      const testsResponse = await fetch(`${API_URL}/tests/class/${studentProfile.class}/section/${studentProfile.section}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      let tests = [];
      if (testsResponse.ok) {
        tests = await testsResponse.json();
      } else {
        console.error('Failed to fetch tests');
      }
      
      // Return profile, lectures and tests
      return {
        profile: studentProfile,
        lectures: lectures,
        tests: tests
      }
    } catch (error) {
      console.error('Schedule fetch error:', error);
      throw error;
    }
  },

  // Fetch student's test marks
  async getMarks(studentId) {
    try {
      const response = await fetch(`${API_URL}/students/${studentId}/marks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: Failed to fetch marks`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Marks fetch error:', error);
      throw error;
    }
  },
  
  // Fetch student's payment details
  async getPayments(studentId) {
    try {
      console.log(`Fetching payments for student ${studentId}`)
      const response = await fetch(`${API_URL}/payments/personalstudent/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: Failed to fetch payment details`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Payments fetch error:', error);
      throw error;
    }
  }
}