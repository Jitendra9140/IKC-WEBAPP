import { useState, useEffect } from 'react'
import { studentService } from '../../services/studentService'
import { showToast } from '../../utils/toast'

const StudentPerformance = () => {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [performanceStats, setPerformanceStats] = useState({
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    totalTests: 0
  })

  useEffect(() => {
    fetchMarks()
  }, [])

  const fetchMarks = async () => {
    try {
      const studentId = localStorage.getItem('userId')
      if (!studentId) {
        console.error('Student ID not found in localStorage')
        setLoading(false)
        return
      }

      const marksData = await studentService.getMarks(studentId)
      console.log('Marks Data:', marksData)
      marksData.forEach((mark, index) => {
        console.log(`Test ${index + 1}:`, mark.test?.topic || 'No topic found')
        console.log(`Test ${index + 1} remarks:`, mark.teacherRemarks || 'No remarks found')
      })
      
      
      if (Array.isArray(marksData) && marksData.length > 0) {
        // Transform marks data to match the expected format
        const formattedTests = marksData.map(mark => ({
          _id: mark._id,
          subject: mark.subject,
          topic: mark.topic || 'Not specified',
          date: mark.test?.testDate || new Date(),
          maxMarks: mark.totalMarks,
          obtainedMarks: mark.marksObtained,
          teacherRemarks: mark.teacherRemarks || ''
        }))

        setTests(formattedTests)

        // Calculate performance stats
        if (formattedTests.length > 0) {
          const scores = formattedTests.map(test => (test.obtainedMarks / test.maxMarks) * 100)
          setPerformanceStats({
            averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores),
            totalTests: formattedTests.length
          })
        }
      } else {
        setTests([])
      }
    } catch (error) {
      console.error('Error fetching marks:', error)
      showToast.error('Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Performance</h2>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Average Score</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{performanceStats.averageScore.toFixed(1)}%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Highest Score</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{performanceStats.highestScore.toFixed(1)}%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Lowest Score</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{performanceStats.lowestScore.toFixed(1)}%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Total Tests</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{performanceStats.totalTests}</div>
        </div>
      </div>

      {/* Test Results Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <h3 className="text-lg font-semibold p-6 border-b">Test Results</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tests.map((test) => (
              <tr key={test._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.topic}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(test.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.obtainedMarks}/{test.maxMarks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {((test.obtainedMarks / test.maxMarks) * 100).toFixed(1)}%
                    </div>
                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${(test.obtainedMarks / test.maxMarks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.teacherRemarks || "No remarks"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Teacher Remarks */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Teacher Remarks</h3>
        {tests.length > 0 ? (
          <div className="space-y-4">
            {tests.filter(test => test.teacherRemarks && test.teacherRemarks.trim() !== '').map((test) => (
              <div key={test._id} className="p-4 border rounded-lg">
                <div className="flex justify-between">
                  <div className="font-medium text-gray-900">{test.subject} - {test.topic}</div>
                  <div className="text-sm text-gray-500">{new Date(test.date).toLocaleDateString()}</div>
                </div>
                <div className="mt-2 text-gray-700">"{test.teacherRemarks}"</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No remarks available</div>
        )}
        {tests.length > 0 && tests.filter(test => test.teacherRemarks && test.teacherRemarks.trim() !== '').length === 0 && (
          <div className="text-center py-4 text-gray-500">No remarks available</div>
        )}
      </div>
    </div>
  )
}

export default StudentPerformance