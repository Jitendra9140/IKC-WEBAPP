import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    subject: '',
    teachesClass: ''
  })
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [monthlyData, setMonthlyData] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [teacherPayments, setTeacherPayments] = useState([])
  const [teacherLectures, setTeacherLectures] = useState([])
  const [paymentLoading, setPaymentLoading] = useState(false)
  
  const [allTeachers, setAllTeachers] = useState([])
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [availableSections, setAvailableSections] = useState([])
  
  useEffect(() => {
    const fetchAllTeachers = async () => {
      try {
        // Fetch all teachers without filters first
        const data = await adminService.getTeachers()
        setAllTeachers(data)
        
        // Extract unique subjects and sections
        const subjects = new Set()
        const sections = new Set()
        
        data.forEach(teacher => {
          // Add all subjects from each teacher
          if (teacher.subjects && teacher.subjects.length > 0) {
            teacher.subjects.forEach(subject => subjects.add(subject))
          }
          
          // Add all sections from assigned classes
          if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
            teacher.assignedClasses.forEach(cls => sections.add(cls.section))
          }
        })
        
        setAvailableSubjects(Array.from(subjects))
        setAvailableSections(Array.from(sections))
      } catch (err) {
        console.error('Failed to load all teachers:', err)
      }
    }
    
    fetchAllTeachers()
  }, [])
  
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        // Update the getTeachers call to pass filters
        const data = await adminService.getTeachers(filters)
        setTeachers(data)
      } catch (err) {
        setError('Failed to load teachers')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const openTeacherModal = (teacher) => {
    setSelectedTeacher(teacher)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const openPaymentModal = async (teacher) => {
    try {
      setSelectedTeacher(teacher)
      setPaymentLoading(true)
      setIsPaymentModalOpen(true)
      
      // Fetch teacher payment data
      const payments = await adminService.getTeacherPayments(teacher._id)
      const lectures = await adminService.getTeacherLectures(teacher._id)
      
      setTeacherPayments(payments)
      setTeacherLectures(lectures)
      
      // Process monthly data
      processMonthlyData(lectures, payments, teacher)
    } catch (err) {
      console.error('Failed to load payment data:', err)
    } finally {
      setPaymentLoading(false)
    }
  }

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false)
  }

  const processMonthlyData = (lectures, payments, teacher) => {
    // Group lectures by month
    const monthlyMap = {}
    
    lectures.forEach(lecture => {
      const date = new Date(lecture.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          key: monthKey,
          month: monthName,
          lectureCount: 0,
          totalHours: 0,
          calculatedAmount: 0,
          paidAmount: 0,
          outstandingAmount: 0,
          lectures: [],
          payments: []
        }
      }
      
      // Find the matching assigned class for this lecture
      const assignedClass = teacher.assignedClasses.find(
        c => c.class === lecture.class && c.section === lecture.section
      )
      
      const hourlyRate = assignedClass ? assignedClass.salaryPerHour : 0
      const hours = lecture.duration || 1
      const amount = hourlyRate * hours
      
      monthlyMap[monthKey].lectureCount += 1
      monthlyMap[monthKey].totalHours += hours
      monthlyMap[monthKey].calculatedAmount += amount
      monthlyMap[monthKey].lectures.push(lecture)
    })
    
    // Add payment information
    payments.forEach(payment => {
      const date = new Date(payment.paidDate || payment.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (monthlyMap[monthKey]) {
        monthlyMap[monthKey].paidAmount += payment.amount
        monthlyMap[monthKey].payments.push(payment)
      }
    })
    
    // Calculate outstanding amounts
    Object.values(monthlyMap).forEach(month => {
      month.outstandingAmount = month.calculatedAmount - month.paidAmount
      month.isFullyPaid = month.outstandingAmount <= 0
    })
    
    // Convert to array and sort by most recent month
    const monthlyData = Object.values(monthlyMap).sort((a, b) => b.key.localeCompare(a.key))
    setMonthlyData(monthlyData)
    
    // Set the most recent month as selected if available
    if (monthlyData.length > 0) {
      setSelectedMonth(monthlyData[0].key)
    }
  }

  const handleMonthSelect = (e) => {
    setSelectedMonth(e.target.value)
  }

  if (loading) return <div className="text-center py-10">Loading teachers...</div>
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
        <div className="flex space-x-4">
          <select
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">All Subjects</option>
            {availableSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          
          <select
            name="teachesClass"
            value={filters.teachesClass}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">All Classes</option>
            <option value="11">11th</option>
            <option value="12">12th</option>
          </select>
          
          <select
            name="section"
            value={filters.section}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">All Sections</option>
            {availableSections.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No teachers found matching the criteria</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map(teacher => (
            <div key={teacher._id} className="bg-white rounded-lg shadow-lg p-6">
              <img
                src={`http://localhost:5000${teacher.imageUrl}`}
                alt={teacher.name} className="w-24 h-24 rounded-full mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 mt-4">{teacher.name}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p><span className="font-medium">Qualification:</span> {teacher.qualifications}</p>
                <p><span className="font-medium">Experience:</span> {teacher.yearsOfExperience} years</p>
                <p><span className="font-medium">Contact:</span> {teacher.phone}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => openTeacherModal(teacher)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                >
                  View Details
                </button>
                <button 
                  onClick={() => openPaymentModal(teacher)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                >
                  View Payments
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teacher Details Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                  {selectedTeacher && (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                      >
                        <img
                          src={`http://localhost:5000${selectedTeacher.imageUrl}`}
                          alt={selectedTeacher.name}
                          className="w-16 h-16 rounded-full mr-4"
                        />
                        <div>
                          <p className="text-xl font-bold">{selectedTeacher.name}</p>
                          <p className="text-sm text-gray-500">{selectedTeacher.email}</p>
                        </div>
                      </Dialog.Title>
                      
                      <div className="mt-4 space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-700">Personal Information</h4>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <p><span className="font-medium">Phone:</span> {selectedTeacher.phone}</p>
                            <p><span className="font-medium">Experience:</span> {selectedTeacher.yearsOfExperience} years</p>
                            <p><span className="font-medium">Qualification:</span> {selectedTeacher.qualifications}</p>
                            <p><span className="font-medium">Address:</span> {selectedTeacher.address}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-700">Teaching Information</h4>
                          <div className="mt-2 text-sm">
                            <p><span className="font-medium">Subjects:</span> {selectedTeacher.subjects?.join(', ') || 'None'}</p>
                            
                            <div className="mt-2">
                              <p className="font-medium">Assigned Classes:</p>
                              {selectedTeacher.assignedClasses && selectedTeacher.assignedClasses.length > 0 ? (
                                <ul className="list-disc ml-5">
                                  {selectedTeacher.assignedClasses.map((c, index) => (
                                    <li key={index}>
                                      Class {c.class} ({c.section}) – ₹{c.salaryPerHour}/hour
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p>None assigned</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeModal}
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

      {/* Teacher Payment Modal */}
      <Transition appear show={isPaymentModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closePaymentModal}>
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
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {selectedTeacher && (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 flex items-center border-b pb-3"
                      >
                        <img
                          src={`http://localhost:5000${selectedTeacher.imageUrl}`}
                          alt={selectedTeacher.name}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-xl font-bold">{selectedTeacher.name} - Payment Details</p>
                          <p className="text-sm text-gray-500">{selectedTeacher.subjects?.join(', ')}</p>
                        </div>
                      </Dialog.Title>
                      
                      {paymentLoading ? (
                        <div className="flex justify-center items-center h-64">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-4">
                          {/* Monthly Payment Summary */}
                          <div>
                            <h2 className="text-xl font-semibold mb-4">Monthly Payment Summary</h2>
                            
                            {monthlyData.length === 0 ? (
                              <div className="text-center text-gray-500 py-6">
                                No lecture data available for this teacher.
                              </div>
                            ) : (
                              <>
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                                  <select
                                    value={selectedMonth}
                                    onChange={handleMonthSelect}
                                    className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  >
                                    {monthlyData.map(month => (
                                      <option key={month.key} value={month.key}>
                                        {month.month}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                {selectedMonth && (
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    {(() => {
                                      const monthData = monthlyData.find(m => m.key === selectedMonth)
                                      if (!monthData) return null
                                      
                                      return (
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white p-3 rounded shadow-sm">
                                              <p className="text-sm text-gray-500">Lectures</p>
                                              <p className="text-xl font-semibold">{monthData.lectureCount}</p>
                                            </div>
                                            <div className="bg-white p-3 rounded shadow-sm">
                                              <p className="text-sm text-gray-500">Teaching Hours</p>
                                              <p className="text-xl font-semibold">{monthData.totalHours}</p>
                                            </div>
                                            <div className="bg-white p-3 rounded shadow-sm">
                                              <p className="text-sm text-gray-500">Calculated Amount</p>
                                              <p className="text-xl font-semibold">₹{monthData.calculatedAmount.toLocaleString()}</p>
                                            </div>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white p-3 rounded shadow-sm">
                                              <p className="text-sm text-gray-500">Paid Amount</p>
                                              <p className="text-xl font-semibold text-green-600">₹{monthData.paidAmount.toLocaleString()}</p>
                                              {monthData.isFullyPaid && monthData.payments.length > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                  Fully paid on {new Date(monthData.payments[monthData.payments.length - 1].paidDate || 
                                                    monthData.payments[monthData.payments.length - 1].createdAt).toLocaleDateString()}
                                                </p>
                                              )}
                                            </div>
                                            <div className="bg-white p-3 rounded shadow-sm">
                                              <p className="text-sm text-gray-500">Outstanding Amount</p>
                                              <p className="text-xl font-semibold text-red-600">₹{monthData.outstandingAmount.toLocaleString()}</p>
                                              {monthData.isFullyPaid && (
                                                <p className="text-xs text-green-600 mt-1">No outstanding balance</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })()}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closePaymentModal}
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

export default AdminTeachers