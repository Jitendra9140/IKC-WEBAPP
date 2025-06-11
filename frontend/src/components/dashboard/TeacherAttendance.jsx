import { useState, useEffect } from 'react'
import { teacherService } from '../../services/teacherService'
import { showToast } from '../../utils/toast'

const TeacherAttendance = () => {
  const [lectures, setLectures] = useState([])
  const [students, setStudents] = useState([])
  const [selectedLecture, setSelectedLecture] = useState('')
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingAttendance, setSavingAttendance] = useState(false)
  const [error, setError] = useState(null)
  const [lecturesWithAttendance, setLecturesWithAttendance] = useState([])
  const [unmarkedLectures, setUnmarkedLectures] = useState([])

  useEffect(() => {
    fetchLectures()
  }, [])

  const fetchLectures = async () => {
    try {
      const teacherId = localStorage.getItem('userId')
      if (!teacherId) {
        setError('Teacher ID not found. Please log out and log in again.')
        setLoading(false)
        return
      }

      const data = await teacherService.getLectures(teacherId)
      // Sort lectures by date (most recent first)
      const sortedLectures = Array.isArray(data) ? data.sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      }) : []
      
      setLectures(sortedLectures)
      
      // Check which lectures already have attendance marked
      const withAttendance = []
      const withoutAttendance = []
      
      for (const lecture of sortedLectures) {
        try {
          const attendance = await teacherService.getAttendanceForLecture(lecture._id)
          if (attendance) {
            withAttendance.push({...lecture, attendanceData: attendance})
          } else {
            withoutAttendance.push(lecture)
          }
        } catch (err) {
          console.error(`Error checking attendance for lecture ${lecture._id}:`, err)
          withoutAttendance.push(lecture)
        }
      }
      
      setLecturesWithAttendance(withAttendance)
      setUnmarkedLectures(withoutAttendance)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching lectures:', err)
      setError('Failed to load lectures. Please try again.')
      setLoading(false)
    }
  }

  const handleLectureSelect = async (e) => {
    const lectureId = e.target.value
    setSelectedLecture(lectureId)
    
    if (!lectureId) {
      setStudents([])
      setAttendanceRecords([])
      return
    }
    
    try {
      setLoading(true)
      
      // Get the selected lecture details
      const selectedLectureDetails = lectures.find(lecture => lecture._id === lectureId)
      
      // Fetch students for this class and section
      const teacherId = localStorage.getItem('userId')
      const studentsData = await teacherService.getStudents(teacherId)
      
      // Filter students by class and section of the selected lecture
      const filteredStudents = studentsData.filter(student => 
        student.class === selectedLectureDetails.class && 
        (!selectedLectureDetails.section || student.section === selectedLectureDetails.section)
      )
      
      setStudents(filteredStudents)
      
      // Check if attendance has already been marked for this lecture
      try {
        const existingAttendance = await teacherService.getAttendanceForLecture(lectureId)
        
        if (existingAttendance) {
          setAttendanceRecords(existingAttendance.records)
        } else {
          // Initialize attendance records for all students as 'present'
          const initialRecords = filteredStudents.map(student => ({
            studentId: student._id,
            studentName: student.name,
            status: 'present'
          }))
          setAttendanceRecords(initialRecords)
        }
      } catch (err) {
        console.error('Error fetching attendance:', err)
        // Initialize attendance records for all students as 'present'
        const initialRecords = filteredStudents.map(student => ({
          studentId: student._id,
          studentName: student.name,
          status: 'present'
        }))
        setAttendanceRecords(initialRecords)
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error loading students:', err)
      showToast.error('Failed to load students for this lecture',)
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords(prevRecords => 
      prevRecords.map(record => 
        record.studentId === studentId ? { ...record, status } : record
      )
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedLecture) {
      showToast.error('Please select a lecture first',)
      return
    }
    
    try {
      setSavingAttendance(true)
      await teacherService.saveAttendance(selectedLecture, attendanceRecords)
      showToast.success('Attendance saved successfully', )
      
      // Refresh the lectures to update which ones have attendance marked
      await fetchLectures()
      
      // Reset the form
      setSelectedLecture('')
      setStudents([])
      setAttendanceRecords([])
      setSavingAttendance(false)
    } catch (err) {
      console.error('Error saving attendance:', err)
      showToast.error('Failed to save attendance',)
      setSavingAttendance(false)
    }
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>

  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Lecture</label>
          <select
            value={selectedLecture}
            onChange={handleLectureSelect}
            className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
          >
            <option value="">Select a lecture</option>
            {unmarkedLectures.map((lecture) => (
              <option key={lecture._id} value={lecture._id}>
                {lecture.subject} - Class {lecture.class} {lecture.section} - {new Date(lecture.date).toLocaleDateString()} {lecture.time}
              </option>
            ))}
          </select>
          {unmarkedLectures.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">All lectures have attendance marked.</p>
          )}
        </div>
        
        {selectedLecture && students.length > 0 ? (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => {
                    const attendanceRecord = attendanceRecords.find(record => record.studentId === student._id)
                    const status = attendanceRecord ? attendanceRecord.status : 'present'
                    
                    return (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">Class {student.class} {student.section}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`attendance-${student._id}`}
                                value="present"
                                checked={status === 'present'}
                                onChange={() => handleAttendanceChange(student._id, 'present')}
                                className="form-radio h-4 w-4 text-indigo-600"
                              />
                              <span className="ml-2 text-sm text-gray-700">Present</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`attendance-${student._id}`}
                                value="absent"
                                checked={status === 'absent'}
                                onChange={() => handleAttendanceChange(student._id, 'absent')}
                                className="form-radio h-4 w-4 text-red-600"
                              />
                              <span className="ml-2 text-sm text-gray-700">Absent</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={savingAttendance}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingAttendance ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        ) : selectedLecture ? (
          <div className="text-center py-4 text-gray-500">No students found for this lecture</div>
        ) : null}
      </div>
      
      {/* Attendance Summary Section */}
      {lecturesWithAttendance.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Attendance Summary</h2>
          <div className="space-y-6">
            {lecturesWithAttendance.map(lecture => {
              const totalStudents = lecture.attendanceData.records.length;
              const presentStudents = lecture.attendanceData.records.filter(record => record.status === 'present').length;
              const absentStudents = totalStudents - presentStudents;
              const attendanceRate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
              
              return (
                <div key={lecture._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{lecture.subject}</h3>
                      <p className="text-sm text-gray-500">
                        Class {lecture.class} {lecture.section} • {formatDate(lecture.date)} • {lecture.time}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">Attendance Rate</div>
                      <div className={`text-lg font-bold ${attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {attendanceRate}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mb-4">
                    <div className="bg-green-100 rounded-full px-3 py-1 text-sm text-green-800">
                      Present: {presentStudents}
                    </div>
                    <div className="bg-red-100 rounded-full px-3 py-1 text-sm text-red-800">
                      Absent: {absentStudents}
                    </div>
                    <div className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-800">
                      Total: {totalStudents}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-indigo-600 hover:text-indigo-800">View Student Details</summary>
                      <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {lecture.attendanceData.records.map(record => (
                              <tr key={record.studentId}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {record.studentName}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    record.status === 'present' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {record.status === 'present' ? 'Present' : 'Absent'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherAttendance