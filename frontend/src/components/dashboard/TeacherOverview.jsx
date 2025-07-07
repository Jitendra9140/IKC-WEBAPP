import { useState, useEffect } from 'react'
import { teacherService } from '../../services/teacherService'
import { formatDate } from '../../utils/dateUtils'

const TeacherOverview = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teacherProfile, setTeacherProfile] = useState(null)
  const [stats, setStats] = useState({
    totalLectures: 0,
    pendingPayment: 0,
    totalStudents: 0,
    upcomingLectures: 0
  })
  const [recentLectures, setRecentLectures] = useState([])
  const [upcomingLectures, setUpcomingLectures] = useState([])

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true)
        const teacherId = localStorage.getItem('userId')
        
        if (!teacherId) {
          setError('Teacher ID not found. Please log out and log in again.')
          setLoading(false)
          return
        }

        // Fetch teacher profile
        const profileData = await teacherService.getProfile(teacherId)
        setTeacherProfile(profileData)

        // Fetch lectures
        const lecturesData = await teacherService.getLectures(teacherId)
        
        // Fetch students
        const studentsData = await teacherService.getStudents(teacherId)
        
        // Fetch payments
        const paymentsData = await teacherService.getPayments(teacherId)

        // Process lectures data
        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()
        
        // Filter lectures for current month
        const thisMonthLectures = lecturesData.filter(lecture => {
          const lectureDate = new Date(lecture.date)
          return lectureDate.getMonth() === thisMonth && lectureDate.getFullYear() === thisYear
        })
        
        // Sort lectures by date
        const sortedLectures = [...lecturesData].sort((a, b) => new Date(b.date) - new Date(a.date))
        
        // Get recent lectures (past lectures, sorted by most recent)
        const pastLectures = sortedLectures.filter(lecture => new Date(lecture.date) < now)
        setRecentLectures(pastLectures.slice(0, 5)) // Get 5 most recent lectures
        
        // Get upcoming lectures (future lectures, sorted by soonest)
        const futureLectures = sortedLectures
          .filter(lecture => new Date(lecture.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
        
        // Get lectures in next 24 hours
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const lecturesNext24Hours = futureLectures.filter(lecture => 
          new Date(lecture.date) <= next24Hours
        )
        
        setUpcomingLectures(futureLectures.slice(0, 3)) // Get 3 upcoming lectures
        
        // Calculate pending payment
        const pendingAmount = paymentsData
          .filter(payment => !payment.paid && payment.status !== 'paid')
          .reduce((total, payment) => total + payment.amount, 0)
        
        // Set stats
        setStats({
          totalLectures: thisMonthLectures.length,
          pendingPayment: pendingAmount,
          totalStudents: studentsData.length,
          upcomingLectures: lecturesNext24Hours.length
        })
        
      } catch (error) {
        console.error('Error fetching teacher data:', error)
        setError('Failed to load data: ' + (error.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherData()
  }, [])

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Total Lectures</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalLectures}</div>
          <div className="mt-2 text-sm text-gray-600">This month</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Pending Payment</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">₹{stats.pendingPayment}</div>
          <div className="mt-2 text-sm text-gray-600">To be received</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Total Students</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalStudents}</div>
          <div className="mt-2 text-sm text-gray-600">Across all classes</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Upcoming Lectures</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.upcomingLectures}</div>
          <div className="mt-2 text-sm text-gray-600">Next 24 hours</div>
        </div>
      </div>

      {/* Recent Lectures */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lectures</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentLectures.length > 0 ? (
                recentLectures.map(lecture => (
                  <tr key={lecture._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(lecture.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecture.class} {lecture.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecture.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecture.duration} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No recent lectures found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Schedule</h3>
        <div className="space-y-4">
          {upcomingLectures.length > 0 ? (
            upcomingLectures.map(lecture => (
              <div key={lecture._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {lecture.subject} - Class {lecture.class} {lecture.section}
                  </div>
                  <div className="text-sm text-gray-600">
                    {lecture.notes || 'No additional notes'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(lecture.date)}, {lecture.time}
                  </div>
                  <div className="text-sm text-gray-600">
                    {lecture.duration} hours
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No upcoming lectures scheduled
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherOverview