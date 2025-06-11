import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'

const AdminOverview = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await adminService.getDashboardStats()
        setStats(data)
      } catch (err) {
        setError('Failed to load dashboard statistics')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) return <div className="text-center py-10">Loading dashboard data...</div>
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>
  if (!stats) return <div className="text-center py-10">No data available</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Total Students</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.counts.students}</div>
          <div className="mt-2 text-sm text-gray-600">Enrolled</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Total Teachers</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.counts.teachers}</div>
          <div className="mt-2 text-sm text-gray-600">Active</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Total Lectures</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.counts.lectures}</div>
          <div className="mt-2 text-sm text-gray-600">Scheduled</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Upcoming Lectures</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.counts.upcomingLectures}</div>
          <div className="mt-2 text-sm text-gray-600">Next 24 hours</div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Due Fees:</span>
              <span className="text-gray-900 font-medium">₹{stats.finances.totalDueFees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Teacher Payments:</span>
              <span className="text-gray-900 font-medium">₹{stats.finances.totalPendingPayments}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Distribution</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">By Class</h4>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(stats.distribution.classes['11'] / stats.counts.students) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">11th: {stats.distribution.classes['11']}</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${(stats.distribution.classes['12'] / stats.counts.students) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">12th: {stats.distribution.classes['12']}</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">By Section</h4>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${(stats.distribution.sections.science / stats.counts.students) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">Science: {stats.distribution.sections.science}</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-600 h-2.5 rounded-full" 
                    style={{ width: `${(stats.distribution.sections.commerce / stats.counts.students) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">Commerce: {stats.distribution.sections.commerce}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOverview