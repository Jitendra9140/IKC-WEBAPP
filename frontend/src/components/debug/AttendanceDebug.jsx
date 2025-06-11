import { useState } from 'react'
import { adminService } from '../../services/adminService'

const AttendanceDebug = () => {
  const [studentId, setStudentId] = useState('')
  const [debugData, setDebugData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDebugData = async () => {
    if (!studentId) {
      setError('Please enter a student ID')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getStudentAttendanceDebug(studentId)
      setDebugData(data)
    } catch (err) {
      console.error('Debug fetch error:', err)
      setError(err.message || 'Failed to fetch debug data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Debug Tool</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student ID
        </label>
        <div className="flex">
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="flex-1 border border-gray-300 rounded-l-md p-2"
            placeholder="Enter student ID"
          />
          <button
            onClick={fetchDebugData}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Loading...' : 'Debug'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {debugData && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(debugData.debug, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Response Format</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Format Version</h3>
                <p>{debugData.formatVersion || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-medium">Timestamp</h3>
                <p>{debugData.timestamp || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Attendance Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Total Classes</h3>
                <p>{debugData.overall?.totalClasses || debugData.total || 0}</p>
              </div>
              <div>
                <h3 className="font-medium">Present</h3>
                <p>{debugData.overall?.present || debugData.attended || 0}</p>
              </div>
              <div>
                <h3 className="font-medium">Absent</h3>
                <p>{debugData.overall?.absent || (debugData.total - debugData.attended) || 0}</p>
              </div>
              <div>
                <h3 className="font-medium">Percentage</h3>
                <p>{(debugData.overall?.percentage || debugData.percentage || 0).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Full Response</h2>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceDebug