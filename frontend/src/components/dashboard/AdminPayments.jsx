import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import { showToast } from '../../utils/toast'

const AdminPayments = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const studentsData = await adminService.getStudents()
        const teachersData = await adminService.getTeachers()
        setStudents(studentsData)
        setTeachers(teachersData)
      } catch (err) {
        setError('Failed to load data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleStudentSelect = (e) => {
    setSelectedStudent(e.target.value)
  }

  const handleTeacherSelect = (e) => {
    setSelectedTeacher(e.target.value)
  }

  const handleStudentPayment = () => {
    if (selectedStudent) {
      // Navigate to student payment page with the selected student ID
      navigate(`/admin/student-payment/${selectedStudent}`)
    } else {
      showToast.error('Please select a student')
    }
  }

  const handleTeacherPayment = () => {
    if (selectedTeacher) {
      // Navigate to teacher payment page with the selected teacher ID
      navigate(`/admin/teacher-payment/${selectedTeacher}`)
    } else {
      showToast.error('Please select a teacher')
    }
  }

  if (loading) return <div className="text-center py-10">Loading data...</div>
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
      
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 rounded-md ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 rounded-md ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setActiveTab('students')}
        >
          Student Payments
        </button>
        <button
          className={`px-4 py-2 rounded-md ${activeTab === 'teachers' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          onClick={() => setActiveTab('teachers')}
        >
          Teacher Payments
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Student Fee Payments</h2>
            <p className="text-gray-600 mb-4">
              Manage student fee payments with installment options and view payment history.
            </p>
            <button
              onClick={() => setActiveTab('students')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Manage Student Payments
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Teacher Salary Payments</h2>
            <p className="text-gray-600 mb-4">
              Process teacher salary payments based on lectures and hours, and view payment history.
            </p>
            <button
              onClick={() => setActiveTab('teachers')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Manage Teacher Payments
            </button>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Student</h2>
          <p className="text-gray-600 mb-4">
            Choose a student to manage their fee payments.
          </p>
          <div className="mt-4">
            <div className="flex space-x-2">
              <select
                value={selectedStudent}
                onChange={handleStudentSelect}
                className="border border-gray-300 rounded-md p-2 flex-grow"
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.name} - Class {student.class} {student.section}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStudentPayment}
                disabled={!selectedStudent}
                className={`px-4 py-2 rounded-md ${!selectedStudent ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                Manage Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'teachers' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Teacher</h2>
          <p className="text-gray-600 mb-4">
            Choose a teacher to manage their salary payments.
          </p>
          <div className="mt-4">
            <div className="flex space-x-2">
              <select
                value={selectedTeacher}
                onChange={handleTeacherSelect}
                className="border border-gray-300 rounded-md p-2 flex-grow"
              >
                <option value="">Select a teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} - {teacher.subject}
                  </option>
                ))}
              </select>
              <button
                onClick={handleTeacherPayment}
                disabled={!selectedTeacher}
                className={`px-4 py-2 rounded-md ${!selectedTeacher ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                Manage Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPayments