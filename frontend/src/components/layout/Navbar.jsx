import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services/authService'

const Navbar = () => {
  const [user, setUser] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        return
      }

      const userData = await authService.getCurrentUser()
      if (userData) {
        // Set default avatar based on role
        let imageUrl = '/images/default-avatar.png'
        if (userData.role === 'admin') {
          imageUrl = '/images/default-admin.png'
        } else if (userData.role === 'student') {
          imageUrl = '/images/default-student.png'
        } else if (userData.role === 'teacher') {
          imageUrl = '/images/default-teacher.png'
        }

        setUser({
          ...userData,
          imageUrl: userData.imageUrl || imageUrl
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  // Listen for authentication changes
  useEffect(() => {
    // Initial fetch
    fetchUserData()

    // Setup storage event listener to detect changes in localStorage (for cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'userId' || e.key === 'userRole') {
        fetchUserData()
      }
    }

    // Listen for localStorage changes (works only across different tabs)
    window.addEventListener('storage', handleStorageChange)

    // Subscribe to auth events (works within the same tab)
    const unsubscribe = authService.onAuthChange(() => {
      fetchUserData()
    })

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      unsubscribe() // Clean up subscription
    }
  }, [])

  const handleLogout = () => {
    authService.logout()
    // Use replace instead of href to ensure a clean navigation
    window.location.replace('/login')
  }

  return (
    <nav className="bg-blue-900 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to={user ? `/${user.role}` : "/home"} 
                className="flex items-center"
              >
                <img 
                  src="/images/ikc-logo.png" 
                  alt="IKC Logo" 
                  className="h-10 w-auto mr-2" 
                />
                <span className="text-2xl font-bold text-white">IKC</span>
              </Link>
            </div>
          </div>

          {user ? (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative">
                <div>
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={user.imageUrl}
                      alt={user.name}
                    />
                    <span className="ml-2 text-white self-center">{user.name}</span>
                  </button>
                </div>

                {isOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to={`/${user.role}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        handleLogout()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link
                to="/login"
                className="text-white text-xl border border-md hover:text-sky-100 px-3 py-2 rounded-md text-sm font-medium shadow-lg shadow-blue-500/50 hover:shadow-blue-600/50 transition-all duration-300"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar