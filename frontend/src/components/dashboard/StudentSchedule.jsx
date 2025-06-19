import { useState, useEffect } from 'react'
import { studentService } from '../../services/studentService'

const StudentSchedule = () => {
  const [lectures, setLectures] = useState([])
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming') // 'upcoming' or 'past'
  const [scheduleType, setScheduleType] = useState('lectures') // 'lectures' or 'tests'
  const [studentProfile, setStudentProfile] = useState(null)
  const [error, setError] = useState(null)
  const [selectedLectureId, setSelectedLectureId] = useState(null)

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true)
        const studentId = localStorage.getItem('userId')
        
        if (!studentId) {
          setError('User ID not found. Please log out and log in again.')
          setLoading(false)
          return
        }
        
        // Use the studentService.getSchedule method to fetch both profile and lectures
        const scheduleData = await studentService.getSchedule(studentId)
        
        if (!scheduleData || !scheduleData.profile) {
          setError('Failed to load student profile')
          setLoading(false)
          return
        }
        
        setStudentProfile(scheduleData.profile)
        
        // Check if lectures exist before processing them
        if (!scheduleData.lectures || !Array.isArray(scheduleData.lectures)) {
          console.warn('No lectures data available or invalid format')
          setLectures([])
        } else {
          // Process lectures to determine if they are upcoming or completed
          const currentDate = new Date()
          const processedLectures = scheduleData.lectures.map(lecture => ({
            ...lecture,
            status: new Date(lecture.date) > currentDate ? 'upcoming' : 'completed'
          }))
          
          setLectures(processedLectures)
        }
        
        // Process tests
        if (scheduleData.tests && Array.isArray(scheduleData.tests)) {
          const currentDate = new Date()
          const processedTests = scheduleData.tests.map(test => ({
            ...test,
            status: new Date(test.testDate) > currentDate ? 'upcoming' : 'completed'
          }))
          
          setTests(processedTests)
        } else {
          setTests([])
        }
      } catch (err) {
        console.error('Error fetching schedule:', err)
        setError(`Failed to load schedule: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchScheduleData()
  }, [])

  const filteredLectures = lectures.filter(lecture => {
    if (filter === 'upcoming') {
      return lecture.status === 'upcoming'
    } else {
      return lecture.status === 'completed'
    }
  })

  const filteredTests = tests.filter(test => {
    if (filter === 'upcoming') {
      return test.status === 'upcoming'
    } else {
      return test.status === 'completed'
    }
  })

  const toggleMessage = (lectureId) => {
    if (selectedLectureId === lectureId) {
      setSelectedLectureId(null) // Hide message if already showing
    } else {
      setSelectedLectureId(lectureId) // Show message for this lecture
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
      <p className="text-red-700">{error}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Student Profile Summary */}
      {studentProfile && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{studentProfile.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-medium">{studentProfile.class} {studentProfile.section}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">School/College</p>
              <p className="font-medium">{studentProfile.schoolOrCollegeName}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Schedule</h2>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${filter === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`px-4 py-2 rounded-md ${filter === 'past' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setFilter('past')}
          >
            Past
          </button>
        </div>
      </div>

      {/* Schedule Type Selector */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-md ${scheduleType === 'lectures' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setScheduleType('lectures')}
        >
          Lectures
        </button>
        <button
          className={`px-4 py-2 rounded-md ${scheduleType === 'tests' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setScheduleType('tests')}
        >
          Tests
        </button>
      </div>

      {/* Lectures Table */}
      {scheduleType === 'lectures' && (
        filteredLectures.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
            No {filter} lectures found.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLectures.map((lecture) => (
                  <tr 
                    key={lecture._id} 
                    className={lecture.message ? "cursor-pointer hover:bg-gray-50" : ""}
                    onClick={lecture.message ? () => toggleMessage(lecture._id) : undefined}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lecture.subject}</div>
                      {lecture.topic && (
                        <div className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Topic:</span> {lecture.topic}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">Class {lecture.class} {lecture.section}</div>
                      {lecture.message && (
                        <div className="text-xs text-indigo-600 mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Click to {selectedLectureId === lecture._id ? 'hide' : 'view'} message
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(lecture.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{lecture.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lecture.duration} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lecture.teacherName || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLectures.map(lecture => lecture.message && selectedLectureId === lecture._id && (
              <div key={`${lecture._id}-message`} className="p-4 border-t border-gray-200 bg-indigo-50 transition-all duration-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-500 text-sm">📝</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Message for {lecture.subject} on {new Date(lecture.date).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">{lecture.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tests Table */}
      {scheduleType === 'tests' && (
        filteredTests.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
            No {filter} tests found.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTests.map((test) => (
                  <tr key={test._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{test.subject}</div>
                      <div className="text-sm text-gray-500">Class {test.class} {test.section}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(test.testDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.testDuration || 1} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.totalMarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

export default StudentSchedule