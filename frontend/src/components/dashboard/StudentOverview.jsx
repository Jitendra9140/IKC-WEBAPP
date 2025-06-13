import { useState, useEffect } from 'react'
import { studentService } from '../../services/studentService'
import { useNavigate } from 'react-router-dom'
import { showToast } from '../../utils/toast'

const StudentOverview = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [studentInfo, setStudentInfo] = useState(null)
  const [stats, setStats] = useState({
    totalLectures: 0,
    upcomingLectures: 0,
    pendingFees: 0,
    testAverage: 0
  })
  const [upcomingLectures, setUpcomingLectures] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const studentId = localStorage.getItem('userId')
        
        if (!studentId) {
          showToast.error('User ID not found. Please log in again.')
          setError('User ID not found. Please log in again.')
          setTimeout(() => {
            navigate('/login')
          }, 2000) // Redirect after showing error for 2 seconds
          return
        }
        
        // Fetch student profile
        const profile = await studentService.getProfile(studentId)
        setStudentInfo({
          name: profile.name,
          class: profile.class,
          section: profile.section,
          admissionDate: new Date(profile.admissionDate)
        })
        
        // Fetch schedule data (lectures and tests)
        const scheduleData = await studentService.getSchedule(studentId)
        
        // Calculate total lectures and upcoming lectures
        const currentDate = new Date()
        const allLectures = scheduleData.lectures || []
        const upcoming = allLectures.filter(lecture => new Date(lecture.date) > currentDate)
        
        // Fetch payment data
        const paymentData = await studentService.getPayments(studentId)
        const pendingFees = paymentData.student?.dueFees || 0
        
        // Fetch marks data for test average
        const marksData = await studentService.getMarks(studentId)
        let testAverage = 0
        
        if (Array.isArray(marksData) && marksData.length > 0) {
          const scores = marksData.map(mark => (mark.marksObtained / mark.totalMarks) * 100)
          testAverage = scores.reduce((a, b) => a + b, 0) / scores.length
        }
        
        // Update stats
        setStats({
          totalLectures: allLectures.length,
          upcomingLectures: upcoming.filter(lecture => {
            const lectureDate = new Date(lecture.date)
            const twoDaysLater = new Date()
            twoDaysLater.setHours(twoDaysLater.getHours() + 48)
            return lectureDate <= twoDaysLater
          }).length,
          pendingFees: pendingFees,
          testAverage: Math.round(testAverage)
        })
        
        // Set upcoming lectures (next 2 days)
        const nextTwoDaysLectures = upcoming
          .filter(lecture => {
            const lectureDate = new Date(lecture.date)
            const twoDaysLater = new Date()
            twoDaysLater.setHours(twoDaysLater.getHours() + 48)
            return lectureDate <= twoDaysLater
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 2)
        
        setUpcomingLectures(nextTwoDaysLectures)
        
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(`Failed to load data: ${err.message || 'Unknown error'}`)
        
        // If the error is related to authentication, redirect to login
        if (err.message === 'User ID not found' || 
            err.response?.status === 401 || 
            err.message.includes('unauthorized')) {
          setTimeout(() => {
            navigate('/login')
          }, 2000)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>

  if (error) return <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
    <p className="text-red-700">{error}</p>
  </div>

  return (
    <div className="space-y-6">
      {/* Student Profile Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-xl font-bold">
            {studentInfo?.name.charAt(0)}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">{studentInfo?.name}</h2>
            <p className="text-gray-600">
              Class {studentInfo?.class} {studentInfo?.section} | Joined {studentInfo?.admissionDate.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Total Lectures</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalLectures}</div>
          <div className="mt-2 text-sm text-gray-600">Attended this semester</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Upcoming Lectures</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.upcomingLectures}</div>
          <div className="mt-2 text-sm text-gray-600">Next 48 hours</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Pending Fees</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">₹{stats.pendingFees}</div>
          <div className="mt-2 text-sm text-gray-600">Due next month</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Test Average</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.testAverage}%</div>
          <div className="mt-2 text-sm text-gray-600">Last 5 tests</div>
        </div>
      </div>

      {/* Upcoming Lectures */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tomorrow's Lectures</h3>
        <div className="space-y-4">
          {upcomingLectures.length > 0 ? (
            upcomingLectures.map((lecture) => (
              <div key={lecture._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {lecture.subject} - Class {lecture.class} {lecture.section}
                  </div>
                  <div className="text-sm text-gray-600">Teacher: {lecture.teacherName}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(lecture.date).toLocaleDateString()}, {lecture.time}
                  </div>
                  <div className="text-sm text-gray-600">{lecture.duration} hours</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">No upcoming lectures</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentOverview