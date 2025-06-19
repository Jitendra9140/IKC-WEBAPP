import { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/authService'
import { showToast } from '../../utils/toast'

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const userRole = localStorage.getItem('userRole')
    
    if (!token || !userId) {
      showToast.error('Authentication required. Please log in.')
      navigate('/login')
      return
    }
    
    // Check if user is trying to access student dashboard as admin
    if (userRole !== 'student') {
      showToast.error('You do not have permission to access this page')
      navigate(`/${userRole}`)
      return
    }
  }, [navigate])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-row align-top min-h-screen">
      {/* Sidebar - Fixed */}
      <div className="w-64 bg-white shadow-sm flex-shrink-0 fixed left-0 top-16 bottom-0 overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Student Portal</h2>
        </div>
        <nav className="mt-4">
          <Link
            to="/student"
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
            to="/student/schedule"
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
            to="/student/performance"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'performance'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            <span className="mr-3">📈</span>
            Performance
          </Link>
          <Link
            to="/student/payments"
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

      {/* Dynamic inner content - with margin for fixed sidebar */}
      <div className="flex-1 p-6 ml-64 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default StudentDashboard