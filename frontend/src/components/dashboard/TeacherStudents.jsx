import { useState, useEffect } from 'react'
import { teacherService } from '../../services/teacherService'

const TeacherStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    class: '',
    stream: ''
  })
  const [filteredStudents, setFilteredStudents] = useState([])

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const teacherId = localStorage.getItem('userId')
        
        if (!teacherId) {
          setError('Teacher ID not found. Please log out and log in again.')
          setLoading(false)
          return
        }
        
        const data = await teacherService.getStudents(teacherId)
        
        // Check if data is valid
        if (Array.isArray(data)) {
          setStudents(data)
          setFilteredStudents(data)
        } else {
          console.error('Invalid data format:', data)
          setError('Failed to load students: Invalid data format')
          setStudents([])
          setFilteredStudents([])
        }
      } catch (error) {
        console.error('Error fetching students:', error)
        setError('Failed to load students: ' + (error.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  useEffect(() => {
    // Apply filters
    let result = [...students]
    
    if (filters.class) {
      result = result.filter(student => student.class === filters.class)
    }
    
    if (filters.stream) {
      result = result.filter(student => student.section && student.section.toLowerCase().includes(filters.stream.toLowerCase()))
    }
    
    setFilteredStudents(result)
  }, [filters, students])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      class: '',
      stream: ''
    })
  }

  // Get unique classes for filter dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))].sort()
  
  // Get unique streams for filter dropdown
  const uniqueStreams = [...new Set(students
    .filter(student => student.section)
    .map(student => student.section))].sort()

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Students</h2>
        
        <div className="flex space-x-4">
          <div>
            <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              id="classFilter"
              name="class"
              value={filters.class}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="streamFilter" className="block text-sm font-medium text-gray-700 mb-1">Stream</label>
            <select
              id="streamFilter"
              name="stream"
              value={filters.stream}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Streams</option>
              {uniqueStreams.map(stream => (
                <option key={stream} value={stream}>{stream}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm">
          No students found with the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student._id}
              className="bg-white shadow rounded-lg p-5 flex flex-col justify-between h-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={student.imageUrl}
                  alt={student.name}
                  className="w-14 h-14 rounded-full object-cover border"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">Class {student.class} {student.section && `(${student.section})`}</p>
                </div>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Phone:</span> {student.phone || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Parent's Phone:</span> {student.parentPhone || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">School/College:</span> {student.schoolOrCollegeName || 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeacherStudents
