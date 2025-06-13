import { useState, useEffect, Fragment } from 'react'
import { adminService } from '../../services/adminService'
import { Dialog, Transition } from '@headlessui/react'
import { showToast } from '../../utils/toast'

const AdminStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    classLevel: '',
    section: ''
  })
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  
  // For dynamic filter options
  const [allStudents, setAllStudents] = useState([])
  const [availableClasses, setAvailableClasses] = useState([])
  const [availableSections, setAvailableSections] = useState([])
  
  // Fetch all students initially to extract filter options
  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const data = await adminService.getStudents()
        setAllStudents(data)
        
        // Extract unique classes and sections
        const classes = new Set()
        const sections = new Set()
        
        data.forEach(student => {
          if (student.class) classes.add(student.class)
          if (student.section) sections.add(student.section)
        })
        
        setAvailableClasses(Array.from(classes))
        setAvailableSections(Array.from(sections))
      } catch (err) {
        console.error('Failed to load all students:', err)
      }
    }
    
    fetchAllStudents()
  }, [])

  // Fetch filtered students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const data = await adminService.getStudents(filters)
        setStudents(data)
      } catch (err) {
        setError('Failed to load students')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const openDetailsModal = (student) => {
    setSelectedStudent(student)
    setIsDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false)
  }

  // Add new state variables for performance and attendance data
  const [performanceData, setPerformanceData] = useState(null)
  const [attendanceData, setAttendanceData] = useState(null)
  const [loadingPerformance, setLoadingPerformance] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(false)

  const openPerformanceModal = async (student) => {
    setSelectedStudent(student)
    setIsPerformanceModalOpen(true)
    setLoadingPerformance(true)
    
    try {
      const data = await adminService.getStudentPerformance(student._id)
      setPerformanceData(data)
    } catch (error) {
      console.error('Error fetching performance data:', error)
      showToast('Failed to load performance data', 'error')
    } finally {
      setLoadingPerformance(false)
    }
  }

  const openAttendanceModal = async (student) => {
    setSelectedStudent(student)
    setIsAttendanceModalOpen(true)
    setLoadingAttendance(true)
    
    try {
      // Try the debug endpoint first
      let data;
      try {
        data = await adminService.getStudentAttendanceDebug(student._id);
        console.log('Debug attendance data:', data); // For debugging in console
      } catch (debugError) {
        console.error('Debug endpoint failed, falling back to regular endpoint:', debugError);
        data = await adminService.getStudentAttendance(student._id);
      }
      
      // Handle both old and new format
      if (data.formatVersion && data.formatVersion >= 2) {
        // New format - already has everything we need
        setAttendanceData(data);
      } else if (data.overall && data.records) {
        // Current format
        setAttendanceData(data);
      } else if (data.total !== undefined && data.attended !== undefined) {
        // Old format - transform to expected format
        setAttendanceData({
          overall: {
            totalClasses: data.total,
            present: data.attended,
            absent: data.total - data.attended,
            percentage: data.percentage || 0
          },
          records: data.lectures || [],
          subjectWise: data.subjectWise || {}
        });
      } else {
        // Unknown format
        console.error('Unknown data format:', data);
        showToast('Attendance data format is unexpected', 'error');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      showToast('Failed to load attendance data', 'error');
    } finally {
      setLoadingAttendance(false);
    }
  }

  const closePerformanceModal = () => {
    setIsPerformanceModalOpen(false)
  }

  const closeAttendanceModal = () => {
    setIsAttendanceModalOpen(false)
  }

  if (loading) return <div className="text-center py-10">Loading students...</div>
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="flex space-x-4">
          <select
            name="classLevel"
            value={filters.classLevel}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">All Classes</option>
            {availableClasses.length > 0 ? (
              availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}th</option>
              ))
            ) : (
              <>
                <option value="11">11th</option>
                <option value="12">12th</option>
              </>
            )}
          </select>
          
          <select
            name="section"
            value={filters.section}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">All Sections</option>
            {availableSections.length > 0 ? (
              availableSections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))
            ) : (
              <>
                <option value="science">Science</option>
                <option value="commerce">Commerce</option>
              </>
            )}
          </select>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No students found matching the criteria</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
            <div key={student._id} className="bg-white rounded-lg shadow-lg p-6">
             <img
  src={selectedStudent.imageUrl ? selectedStudent.imageUrl : 'https://via.placeholder.com/150'}
  alt={selectedStudent.name}
  className="w-16 h-16 rounded-full mr-4 object-cover"
/>
              <h3 className="text-lg font-semibold text-gray-900 mt-4 text-center">{student.name}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p><span className="font-medium">Class:</span> {student.class}th {student.section}</p>
                <p><span className="font-medium">School/College:</span> {student.schoolOrCollegeName}</p>
                <p><span className="font-medium">Contact:</span> {student.phone}</p>
                <p><span className="font-medium">Due Fees:</span> ₹{student.dueFees}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => openDetailsModal(student)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                >
                  Details
                </button>
                <button 
                  onClick={() => openPerformanceModal(student)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                >
                  Performance
                </button>
                <button 
                  onClick={() => openAttendanceModal(student)}
                  className="px-3 py-1 bg-purple-500 text-white rounded-md text-sm"
                >
               Attendance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Details Modal */}
      <Transition appear show={isDetailsModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeDetailsModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {selectedStudent && (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                      >
                        <img
                           src={selectedStudent.imageUrl ? `${import.meta.env.VITE_API_URL}${selectedStudent.imageUrl}` : 'https://via.placeholder.com/150'}
                          alt={selectedStudent.name}
                          className="w-16 h-16 rounded-full mr-4 object-cover"
                        />
                        <div>
                          <p className="text-xl font-bold">{selectedStudent.name}</p>
                          <p className="text-sm text-gray-500">Class {selectedStudent.class}th - {selectedStudent.section}</p>
                        </div>
                      </Dialog.Title>
                      
                      <div className="mt-4 space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-700">Personal Information</h4>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <p><span className="font-medium">Phone:</span> {selectedStudent.phone}</p>
                            <p><span className="font-medium">Parent Phone:</span> {selectedStudent.parentPhone}</p>
                            <p><span className="font-medium">DOB:</span> {new Date(selectedStudent.dob).toLocaleDateString()}</p>
                            <p><span className="font-medium">Address:</span> {selectedStudent.address}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-700">Academic Information</h4>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <p><span className="font-medium">School/College:</span> {selectedStudent.schoolOrCollegeName}</p>
                            <p><span className="font-medium">Admission Date:</span> {new Date(selectedStudent.admissionDate).toLocaleDateString()}</p>
                            {selectedStudent.tenthPercentage && (
                              <>
                                <p><span className="font-medium">10th %:</span> {selectedStudent.tenthPercentage}%</p>
                                <p><span className="font-medium">10th Board:</span> {selectedStudent.tenthBoard}</p>
                                <p><span className="font-medium">10th Year:</span> {selectedStudent.tenthPassingYear}</p>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-700">Fee Information</h4>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <p><span className="font-medium">Overall Fees:</span> ₹{selectedStudent.overallFees}</p>
                            <p><span className="font-medium">Paid Fees:</span> ₹{selectedStudent.paidFees}</p>
                            <p><span className="font-medium">Due Fees:</span> ₹{selectedStudent.dueFees}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeDetailsModal}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Student Performance Modal */}
      <Transition appear show={isPerformanceModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closePerformanceModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {selectedStudent && (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 border-b pb-3"
                      >
                        <div className="flex items-center">
                          <img
                             src={selectedStudent.imageUrl ? `${import.meta.env.VITE_API_URL}${selectedStudent.imageUrl}` : 'https://via.placeholder.com/150'}
                            alt={selectedStudent.name}
                            className="w-12 h-12 rounded-full mr-3 object-cover"
                          />
                          <div>
                            <p className="text-xl font-bold">{selectedStudent.name} - Performance</p>
                            <p className="text-sm text-gray-500">Class {selectedStudent.class}th - {selectedStudent.section}</p>
                          </div>
                        </div>
                      </Dialog.Title>
                      
                      <div className="mt-4">
                        {loadingPerformance ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Loading performance data...</p>
                          </div>
                        ) : !performanceData ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No performance data available for this student.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Performance Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-gray-600 text-sm font-medium">Overall Percentage</div>
                                <div className="mt-2 text-3xl font-semibold text-gray-900">
                                  {performanceData.overall.percentage.toFixed(1)}%
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-gray-600 text-sm font-medium">Total Tests</div>
                                <div className="mt-2 text-3xl font-semibold text-gray-900">
                                  {performanceData.overall.testsCount}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-gray-600 text-sm font-medium">Total Marks</div>
                                <div className="mt-2 text-3xl font-semibold text-gray-900">
                                  {performanceData.overall.totalObtained}/{performanceData.overall.totalMax}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-gray-600 text-sm font-medium">Subjects</div>
                                <div className="mt-2 text-3xl font-semibold text-gray-900">
                                  {Object.keys(performanceData.subjects).length}
                                </div>
                              </div>
                            </div>
                            
                            {/* Recent Tests */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                              <h3 className="text-lg font-semibold p-4 border-b">Recent Tests</h3>
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {performanceData.recentTests.map((test) => (
                                    <tr key={test._id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.subject}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.topic}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(test.date).toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {test.marksObtained}/{test.totalMarks}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="text-sm font-medium text-gray-900">
                                            {test.percentage.toFixed(1)}%
                                          </div>
                                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                            <div 
                                              className="bg-indigo-600 h-2 rounded-full" 
                                              style={{ width: `${test.percentage}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            
                            {/* Subject-wise Performance */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                              <h3 className="text-lg font-semibold p-4 border-b">Subject-wise Performance</h3>
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(performanceData.subjects).map(([subject, data]) => (
                                  <div key={subject} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-medium text-gray-900">{subject}</h4>
                                      <span className="text-lg font-semibold">{data.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                      <div 
                                        className="bg-indigo-600 h-2.5 rounded-full" 
                                        style={{ width: `${data.percentage}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Marks: {data.totalObtained}/{data.totalMax} ({data.tests.length} tests)
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closePerformanceModal}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Student Attendance Modal */}
      <Transition appear show={isAttendanceModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeAttendanceModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {selectedStudent && (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 border-b pb-3"
                      >
                        <div className="flex items-center">
                          <img
                             src={selectedStudent.imageUrl ? `${import.meta.env.VITE_API_URL}${selectedStudent.imageUrl}` : 'https://via.placeholder.com/150'}
                            alt={selectedStudent.name}
                            className="w-12 h-12 rounded-full mr-3 object-cover"
                          />
                          <div>
                            <p className="text-xl font-bold">{selectedStudent.name} - Attendance</p>
                            <p className="text-sm text-gray-500">Class {selectedStudent.class}th - {selectedStudent.section}</p>
                          </div>
                        </div>
                      </Dialog.Title>
                      
                      <div className="mt-4">
                        {loadingAttendance ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Loading attendance data...</p>
                          </div>
                        ) : !attendanceData ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No attendance data available for this student.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Attendance Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-gray-600 text-sm font-medium">Overall Attendance</div>
                                <div className="mt-2 text-3xl font-semibold text-gray-900">
                                  {attendanceData.overall.percentage.toFixed(1)}%
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-gray-600 text-sm font-medium">Total Classes</div>
                                <div className="mt-2 text-3xl font-semibold text-gray-900">
                                  {attendanceData.overall.totalClasses}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-gray-600 text-sm font-medium">Present</div>
                                <div className="mt-2 text-3xl font-semibold text-green-600">
                                  {attendanceData.overall.present}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-gray-600 text-sm font-medium">Absent</div>
                                <div className="mt-2 text-3xl font-semibold text-red-600">
                                  {attendanceData.overall.absent}
                                </div>
                              </div>
                            </div>
                            
                            {/* Subject-wise Attendance */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                              <h3 className="text-lg font-semibold p-4 border-b">Subject-wise Attendance</h3>
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(attendanceData.subjectWise).map(([subject, data]) => (
                                  <div key={subject} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-medium text-gray-900">{subject}</h4>
                                      <span className="text-lg font-semibold">{data.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                      <div 
                                        className="bg-indigo-600 h-2.5 rounded-full" 
                                        style={{ width: `${data.percentage}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Present: {data.present}/{data.total} classes
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Attendance Records */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                              <h3 className="text-lg font-semibold p-4 border-b">Attendance Records</h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                      
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {attendanceData.records.map((record, index) => (
                                      <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {record.lecture.subject}
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeAttendanceModal}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default AdminStudents