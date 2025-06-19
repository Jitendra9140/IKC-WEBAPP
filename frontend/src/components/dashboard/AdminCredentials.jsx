import { useState, useEffect } from 'react'
import { showToast } from '../../utils/toast'
import { adminCredentialsService } from '../../services/adminCredentialsService'

const AdminCredentials = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adminUsername, setAdminUsername] = useState('')

  useEffect(() => {
    // Fetch the current admin username (not the password for security reasons)
    const fetchAdminUsername = async () => {
      try {
        const username = await adminCredentialsService.getAdminUsername()
        console.log('Fetched admin username:', username)
        setAdminUsername(username)
      } catch (error) {
        console.error('Error fetching admin username:', error)
      }
    }

    fetchAdminUsername()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user types
  }

  const validateForm = () => {
    if (!credentials.currentPassword) {
      setError('Current password is required')
      return false
    }

    if (credentials.newPassword && credentials.newPassword.length < 6) {
      setError('New password must be at least 6 characters long')
      return false
    }

    if (credentials.newPassword && credentials.newPassword !== credentials.confirmPassword) {
      setError('New passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      await adminCredentialsService.updateCredentials(
        credentials.currentPassword,
        credentials.username || undefined,
        credentials.newPassword || undefined
      )
      
      // Update the displayed username if it was changed
      if (credentials.username) {
        setAdminUsername(credentials.username)
      }
      
      // Reset form
      setCredentials({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error updating admin credentials:', error)
      setError(error.response?.data?.message || 'Failed to update credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Credentials</h2>
      
      <div className="mb-6">
        <p className="text-gray-700">
          Current Admin Username: <span className="font-semibold">{adminUsername || 'Loading...'}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          You can update your admin username and password below. For security reasons, your current password is required.
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            New Username (Email)
          </label>
          <input
            type="email"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Leave blank to keep current username"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
            Current Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={credentials.currentPassword}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={credentials.newPassword}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Leave blank to keep current password"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={credentials.confirmPassword}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Confirm new password"
            disabled={!credentials.newPassword}
          />
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Credentials'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminCredentials