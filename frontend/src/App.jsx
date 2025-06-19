import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LoginForm from './components/auth/LoginForm'
// Remove RegisterSelect import
// Remove StudentRegister and TeacherRegister imports
import TeacherDashboard from './components/dashboard/TeacherDashboard'
import TeacherOverview from './components/dashboard/TeacherOverview'
import TeacherSchedule from './components/dashboard/TeacherSchedule'
import TeacherStudents from './components/dashboard/TeacherStudents'
import TeacherPayments from './components/dashboard/TeacherPayments'
import TeacherTests from './components/dashboard/TeacherTests'
import TeacherMarks from './components/dashboard/TeacherMarks'
import TeacherAttendance from './components/dashboard/TeacherAttendance'
import StudentDashboard from './components/dashboard/StudentDashboard'
import StudentOverview from './components/dashboard/StudentOverview'
import StudentSchedule from './components/dashboard/StudentSchedule'
import StudentPerformance from './components/dashboard/StudentPerformance'
import StudentPayments from './components/dashboard/StudentPayments'
import AdminDashboard from './components/dashboard/AdminDashboard'
import AdminOverview from './components/dashboard/AdminOverview'
import AdminLectures from './components/dashboard/AdminLectures'
import AdminTeachers from './components/dashboard/AdminTeachers'
import AdminStudents from './components/dashboard/AdminStudents'
import AdminPayments from './components/dashboard/AdminPayments'
import AdminStudentPayments from './components/dashboard/AdminStudentPayments'
import AdminTeacherPayments from './components/dashboard/AdminTeacherPayments'
import AdminRegistration from './components/dashboard/AdminRegistration'
import AdminCredentials from './components/dashboard/AdminCredentials'
// Import the new AttendanceDebug component
import AttendanceDebug from './components/debug/AttendanceDebug'
// Import Navbar component
import Navbar from './components/layout/Navbar'
// Import Home component
import Home from './pages/Home'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth error:', error)
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      {/* Add ToastContainer here */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="app">
        {/* Add Navbar component */}
        <Navbar />
        <div className="pt-16"> 
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<LoginForm />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherDashboard />}>
            <Route index element={<TeacherOverview />} />
            <Route path="schedule" element={<TeacherSchedule />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="tests" element={<TeacherTests />} />
            <Route path="marks" element={<TeacherMarks />} />
            <Route path="payments" element={<TeacherPayments />} />
            <Route path="attendance" element={<TeacherAttendance />} />
          </Route>
          
          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />}>
            <Route index element={<StudentOverview />} />
            <Route path="schedule" element={<StudentSchedule />} />
            <Route path="performance" element={<StudentPerformance />} />
            <Route path="payments" element={<StudentPayments />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} />
            <Route path="lectures" element={<AdminLectures />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="student-payment/:studentId" element={<AdminStudentPayments />} />
            <Route path="teacher-payment/:teacherId" element={<AdminTeacherPayments />} />
            <Route path="registration" element={<AdminRegistration />} />
            <Route path="credentials" element={<AdminCredentials />} />
            {/* Add the new debug route */}
            <Route path="debug/attendance" element={<AttendanceDebug />} />
          </Route>
        </Routes>
        </div> {/* Close the padding-top div */}
      </div>
    </Router>
  )
}

export default App
{/* Admin Routes */}
<Route path="/admin" element={<AdminDashboard />}>
  <Route index element={<AdminOverview />} />
  <Route path="lectures" element={<AdminLectures />} />
  <Route path="teachers" element={<AdminTeachers />} />
  <Route path="students" element={<AdminStudents />} />
  <Route path="payments" element={<AdminPayments />} />
  <Route path="student-payment/:studentId" element={<AdminStudentPayments />} />
  <Route path="teacher-payment/:teacherId" element={<AdminTeacherPayments />} />
  <Route path="registration" element={<AdminRegistration />} />
  {/* Add the new debug route */}
  <Route path="debug/attendance" element={<AttendanceDebug />} />
</Route>


