import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'

const LoginForm = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loginAs, setLoginAs] = useState('student')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await authService.login(formData.email, formData.password)
      const { role } = response
      
      // Small delay to ensure auth state is updated before navigation
      setTimeout(() => {
        // Redirect based on user role
        switch (role) {
          case 'teacher':
            navigate('/teacher')
            break
          case 'student':
            navigate('/student')
            break
          case 'admin':
            navigate('/admin')
            break
          default:
            navigate('/dashboard')
        }
      }, 100) // Small delay for state to propagate
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex transform hover:scale-[1.01] transition-all duration-300">
        {/* Left side with image */}
        <div className="w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6 hidden md:flex relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 transform rotate-45 translate-y-[-50%] translate-x-[-50%]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-black opacity-10 transform rotate-45 translate-y-[50%] translate-x-[50%]"></div>
          </div>
          <div className="flex flex-col items-center justify-center relative z-10">
            <img 
              src="/images/ikc-logo.png" 
              alt="IKC Logo" 
              className="w-40 h-40 drop-shadow-2xl animate-pulse-slow" 
            />
          </div>
        </div>
        
        {/* Right side with login form */}
        <div className="w-full md:w-3/5 p-10 bg-gradient-to-br from-white to-gray-50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 drop-shadow-sm">Login to IKC Class</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto mt-2 rounded-full"></div>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-md hover:shadow-lg focus:shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-md hover:shadow-lg focus:shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="loginAs" className="block text-sm font-medium text-gray-700 mb-1">Login As</label>
                <select
                  id="loginAs"
                  name="loginAs"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-md hover:shadow-lg focus:shadow-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all duration-200"
                  value={loginAs}
                  onChange={(e) => setLoginAs(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-xl hover:shadow-2xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginForm