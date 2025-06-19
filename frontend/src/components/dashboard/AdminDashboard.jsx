import { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/authService'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    } else {
      // Set basic admin user info
      setUser({
        name: 'Administrator',
        role: 'admin',
        imageUrl: '/images/default-admin.png' // Default admin avatar
      })
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
        {/* Admin Profile Section */}
        {user && (
          <div className="p-4 border-b flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img 
                src={user.imageUrl} 
                alt="Admin" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-600 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        
        <nav className="mt-4">
          <Link
            to="/admin"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'overview'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="mr-3">📊</span>
            Dashboard
          </Link>
          <Link
            to="/admin/teachers"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'teachers'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('teachers')}
          >
            <span className="mr-3">👨‍🏫</span>
            Teachers
          </Link>
          <Link
            to="/admin/students"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'students'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('students')}
          >
            <span className="mr-3">👨‍🎓</span>
            Students
          </Link>
          <Link
            to="/admin/lectures"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'lectures'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('lectures')}
          >
            <span className="mr-3">📚</span>
            Lectures
          </Link>
          <Link
            to="/admin/payments"
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
          <Link
            to="/admin/registration"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'registration'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('registration')}
          >
            <span className="mr-3">👥</span>
            Registration
          </Link>
          <Link
            to="/admin/credentials"
            className={`flex items-center px-4 py-3 ${
              activeTab === 'credentials'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('credentials')}
          >
            <span className="mr-3">🔐</span>
            Admin Credentials
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

export default AdminDashboard