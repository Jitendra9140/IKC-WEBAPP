import { useState, useEffect } from 'react'
import { teacherService } from '../../services/teacherService'
import { showToast } from '../../utils/toast'

const TeacherPayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teacher, setTeacher] = useState(null)
  const [lectures, setLectures] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingAmount: 0,
    thisMonthEarnings: 0
  })
  const [newPayment, setNewPayment] = useState({
    month: '',
    hours: 0,
    amount: 0,
    remarks: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherId = localStorage.getItem('userId')
        if (!teacherId) {
          setError('Teacher ID not found. Please log out and log in again.')
          setLoading(false)
          return
        }
        
        // Fetch teacher profile, payments and lectures
        const teacherData = await teacherService.getProfile(teacherId)
        const paymentsData = await teacherService.getPayments(teacherId)
        const lecturesData = await teacherService.getLectures(teacherId)
        console.log('Teacher data:', teacherData)
        console.log('Payments data:', paymentsData)
        console.log('Lectures data:', lecturesData)  
        setTeacher(teacherData)
        setPayments(paymentsData)
        setLectures(lecturesData)
        
        // Process monthly data and calculate stats together
        const monthlyMap = processMonthlyDataAndCalculateStats(lecturesData, paymentsData, teacherData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data: ' + (error.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const processMonthlyDataAndCalculateStats = (lectures, payments, teacher) => {
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
    
    // Add payment information - group all payments by month
    payments.forEach(payment => {
      // Use the payment's month field directly if available, otherwise derive from date
      const monthKey = payment.month || (() => {
        const date = new Date(payment.date || payment.createdAt)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      })();
      
      if (monthlyMap[monthKey]) {
        if (payment.paid || payment.status === 'paid') {
          monthlyMap[monthKey].paidAmount += payment.amount
        }
        monthlyMap[monthKey].payments.push(payment)
      } else {
        // Handle payments for months with no lectures
        const date = new Date(payment.paidDate || payment.date || payment.createdAt)
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })
        
        monthlyMap[monthKey] = {
          key: monthKey,
          month: monthName,
          lectureCount: 0,
          totalHours: 0,
          calculatedAmount: 0,
          paidAmount: payment.paid || payment.status === 'paid' ? payment.amount : 0,
          outstandingAmount: 0,
          lectures: [],
          payments: [payment]
        }
      }
    })
    
    // Calculate outstanding amounts
    Object.values(monthlyMap).forEach(month => {
      month.outstandingAmount = Math.max(0, month.calculatedAmount - month.paidAmount)
      month.isFullyPaid = month.outstandingAmount <= 0
    })
    
    // Convert to array and sort by most recent month
    const monthlyData = Object.values(monthlyMap).sort((a, b) => b.key.localeCompare(a.key))
    setMonthlyData(monthlyData)
    
    // Set the most recent month as selected if available
    if (monthlyData.length > 0) {
      // Find the first month that isn't fully paid
      const firstUnpaidMonth = monthlyData.find(month => !month.isFullyPaid)
      setSelectedMonth(firstUnpaidMonth ? firstUnpaidMonth.key : monthlyData[0].key)
    }
    
    // Calculate stats
    const total = payments.reduce((acc, payment) => acc + payment.amount, 0)
    const pending = payments
      .filter(payment => !payment.paid && payment.status !== 'paid')
      .reduce((acc, payment) => acc + payment.amount, 0)
    
    // Get current month and year
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    // Find current month's data in the processed monthly data
    const currentMonthData = monthlyMap[currentMonth]
    const thisMonthEarnings = currentMonthData ? currentMonthData.calculatedAmount : 0

    setStats({
      totalEarned: total,
      pendingAmount: pending,
      thisMonthEarnings: thisMonthEarnings
    })
    
    return monthlyMap
  }

  const handleMonthSelect = (e) => {
    setSelectedMonth(e.target.value)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {/* Stats Cards */}
      <h2 className="text-2xl font-semibold text-gray-800">Payments</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Total Earned</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">₹{stats.totalEarned}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">Pending Amount</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">₹{stats.pendingAmount}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm font-medium">This Month</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">₹{stats.thisMonthEarnings}</div>
        </div>
      </div>

      {/* Monthly Payment Summary */}
      {teacher && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Payment Summary</h2>
          
          {monthlyData.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No lecture data available.
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
                                  monthData.payments[monthData.payments.length - 1].date || 
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
                        
                        <div>
                          <h3 className="text-md font-medium mb-2">Lecture Details</h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {monthData.lectures.map(lecture => {
                                  const assignedClass = teacher.assignedClasses.find(
                                    c => c.class === lecture.class && c.section === lecture.section
                                  )
                                  const hourlyRate = assignedClass ? assignedClass.salaryPerHour : 0
                                  const hours = lecture.duration || 1
                                  const amount = hourlyRate * hours
                                  
                                  return (
                                    <tr key={lecture._id}>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(lecture.date).toLocaleDateString()}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {lecture.class} {lecture.section}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {lecture.subject}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {hours}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        ₹{amount.toLocaleString()}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        
                        {monthData.payments.length > 0 && (
                          <div>
                            <h3 className="text-md font-medium mb-2">Payment History</h3>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {monthData.payments.map(payment => (
                                    <tr key={payment._id}>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(payment.paidDate || payment.date || payment.createdAt).toLocaleDateString()}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ₹{payment.amount.toLocaleString()}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(payment.paid || payment.status === 'paid') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                          {(payment.paid || payment.status === 'paid') ? 'Paid' : 'Pending'}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {payment.description || payment.remarks || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default TeacherPayments