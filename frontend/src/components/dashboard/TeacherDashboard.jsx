// TeacherDashboard.jsx
import { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/authService'

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-row align-top h-screen h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Teacher Portal</h2>
        </div>
        <nav className="mt-4">
          <Link
            to="/teacher"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'overview'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="mr-3">📊</span>
            Overview
          </Link>
          <Link
            to="/teacher/schedule"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'schedule'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('schedule')}
          >
            <span className="mr-3">📅</span>
            Schedule
          </Link>
          <Link
            to="/teacher/students"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'students'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('students')}
          >
            <span className="mr-3">👥</span>
            Students
          </Link>
          <Link
            to="/teacher/tests"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'tests'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('tests')}
          >
            <span className="mr-3">📝</span>
            Tests
          </Link>
          <Link
            to="/teacher/marks"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'marks'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('marks')}
          >
            <span className="mr-3">✅</span>
            Marks
          </Link>
        
          <Link
            to="/teacher/attendance"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'attendance'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('attendance')}
          >
            <span className="mr-3">📋</span>
            Attendance
          </Link>
          <Link
            to="/teacher/payments"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'payments'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('payments')}
          >
            <span className="mr-3">💰</span>
            Payments
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 mt-4"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </nav>
      </div>

      {/* Dynamic inner content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default TeacherDashboard

