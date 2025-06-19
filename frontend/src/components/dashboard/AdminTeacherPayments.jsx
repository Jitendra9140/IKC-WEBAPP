import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { showToast } from '../../utils/toast'
import { useParams } from 'react-router-dom'

const AdminTeacherPayments = () => {
  const { teacherId } = useParams()
  
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [payments, setPayments] = useState([])
  const [lectures, setLectures] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [newPayment, setNewPayment] = useState({
    month: '',
    hours: 0,
    amount: 0,
    remarks: ''
  })

  useEffect(() => {
    if (teacherId) {
      fetchTeacherData()
    }
  }, [teacherId])

  const fetchTeacherData = async () => {
    try {
      setLoading(true)
      const teacherData = await adminService.getTeacherById(teacherId)
      const teacherPayments = await adminService.getTeacherPayments(teacherId)
      const LectureTeacher=await adminService.getTeacherLectures(teacherId)
      console.log('Teacher Lectures:', LectureTeacher)
      console.log('Teacher Payments:', teacherPayments)
      console.log('Teacher Data:', teacherData)
      

      setTeacher(teacherData)
      setPayments(teacherPayments)
      setLectures(LectureTeacher)
      
      // Process monthly data
      processMonthlyData(LectureTeacher,teacherPayments, teacherData)
    } catch (error) {
      showToast.error('Failed to load teacher data')
    } finally {
      setLoading(false)
    }
  }

  const processMonthlyData = (lectures, payments, teacher) => {
  console.log('ADMIN DEBUG: Starting processMonthlyData')
  console.log('ADMIN DEBUG: Lectures:', lectures)
  console.log('ADMIN DEBUG: Payments:', payments)
  console.log('ADMIN DEBUG: Teacher:', teacher)
  
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
    
    console.log(`ADMIN DEBUG: Processing lecture for ${monthKey}:`, {
      class: lecture.class,
      section: lecture.section,
      hourlyRate,
      hours,
      amount
    })
    
    monthlyMap[monthKey].lectureCount += 1
    monthlyMap[monthKey].totalHours += hours
    monthlyMap[monthKey].calculatedAmount += amount
    monthlyMap[monthKey].lectures.push(lecture)
  })
  
  // Add payment information
  payments.forEach(payment => {
    // Use the payment's month field directly instead of deriving from date
    const monthKey = payment.month
    
    console.log(`ADMIN DEBUG: Processing payment for ${monthKey}:`, {
      paymentId: payment._id,
      amount: payment.amount,
      paid: payment.paid,
      status: payment.status,
      date: payment.paidDate || payment.createdAt
    })
    
    if (monthlyMap[monthKey]) {
      console.log(`ADMIN DEBUG: Adding paid amount ${payment.amount} to ${monthKey}`)
      monthlyMap[monthKey].paidAmount += payment.amount
      monthlyMap[monthKey].payments.push(payment)
    } else {
      // Handle payments for months with no lectures
      const date = new Date(payment.paidDate || payment.createdAt)
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      
      console.log(`ADMIN DEBUG: Creating new month entry for payment in ${monthKey}`)
      monthlyMap[monthKey] = {
        key: monthKey,
        month: monthName,
        lectureCount: 0,
        totalHours: 0,
        calculatedAmount: 0,
        paidAmount: payment.amount,
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
    console.log(`ADMIN DEBUG: Month ${month.key} calculations:`, {
      calculatedAmount: month.calculatedAmount,
      paidAmount: month.paidAmount,
      outstandingAmount: month.outstandingAmount,
      isFullyPaid: month.isFullyPaid
    })
  })
  
  // Convert to array and sort by most recent month
  const monthlyData = Object.values(monthlyMap).sort((a, b) => b.key.localeCompare(a.key))
  console.log('ADMIN DEBUG: Sorted monthlyData:', monthlyData)
  setMonthlyData(monthlyData)
  
  // Set the most recent month as selected if available
  if (monthlyData.length > 0) {
    // Find the first month that isn't fully paid
    const firstUnpaidMonth = monthlyData.find(month => !month.isFullyPaid)
    setSelectedMonth(firstUnpaidMonth ? firstUnpaidMonth.key : monthlyData[0].key)
    console.log('ADMIN DEBUG: Selected month:', firstUnpaidMonth ? firstUnpaidMonth.key : monthlyData[0].key)
  }
}

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewPayment(prev => {
      const updated = { ...prev, [name]: value }
      
      // If month is selected, calculate amount based on hours and rate
      if (name === 'month' || name === 'hours') {
        const selectedMonthData = monthlyData.find(m => m.key === updated.month)
        if (selectedMonthData && updated.hours) {
          // Calculate amount based on the average hourly rate for this teacher
          const avgHourlyRate = teacher.assignedClasses.reduce(
            (sum, cls) => sum + cls.salaryPerHour, 0
          ) / teacher.assignedClasses.length
          
          updated.amount = avgHourlyRate * updated.hours
        }
      }
      
      return updated
    })
  }

  const handleMonthSelect = (e) => {
    setSelectedMonth(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Find the selected month data
      const monthData = monthlyData.find(m => m.key === newPayment.month)
      if (!monthData) {
        showToast.error( 'Please select a valid month')
        return
      }
      
      // Check if there's an outstanding amount
      if (monthData.outstandingAmount <= 0) {
        if (!window.confirm('There is no outstanding amount for this month. Do you still want to record this payment?')) {
          return
        }
      }
      
      // Create payment data
      const paymentData = {
        amount: newPayment.amount,
        remarks: newPayment.remarks || `Payment for ${monthData.month} (${newPayment.hours} hours)`,
        hours: newPayment.hours,
        month: newPayment.month  // Add the month field here
      }
      
      await adminService.createTeacherPayment(teacherId, paymentData)
      showToast.success('Payment recorded successfully')
      fetchTeacherData()
      
      // Reset form
      setNewPayment({
        month: '',
        hours: 0,
        amount: 0,
        remarks: ''
      })
    } catch (error) {
      showToast.error('Failed to record payment')
    }
  }

  const handleSettleMonthlyPayment = async () => {
  if (!selectedMonth) return;

  const monthData = monthlyData.find(m => m.key === selectedMonth);
  if (!monthData || monthData.outstandingAmount <= 0) return;

  try {
    const paymentData = {
      month: selectedMonth,  // Make sure this is in 'YYYY-MM' format
      amount: monthData.outstandingAmount,
      remarks: `Settlement for ${monthData.month} (${monthData.lectureCount} lectures, ${monthData.totalHours} hours)`,
      hours: monthData.totalHours,
      paid: true,
      paidDate: new Date()
    };

    await adminService.createTeacherPayment(teacherId, paymentData);

    showToast.success(`✅ Payment for ${monthData.month} settled successfully`);
    fetchTeacherData();  // Refresh data

  } catch (error) {
    if (error.message.includes('already been settled')) {
      showToast.warning(`⚠️ Payment for ${monthData.month} has already been settled.`);
    } else {
      showToast.error('❌ Failed to settle payment');
    }
    console.error(error);
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {teacher && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Teacher Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{teacher.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium">{teacher.subjects.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hourly Rate</p>
              <span className="font-medium">
                {teacher.assignedClasses.map((cls, index) => (
                  <div key={index}>
                    ₹{cls.salaryPerHour} ({cls.section} - Class {cls.class})
                  </div>
                ))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Payment Summary */}
      <div className="bg-white rounded-lg shadow p-6">
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
                  
                  console.log('ADMIN DEBUG: Rendering selected month data:', {
                    key: monthData.key,
                    month: monthData.month,
                    lectureCount: monthData.lectureCount,
                    totalHours: monthData.totalHours,
                    calculatedAmount: monthData.calculatedAmount,
                    paidAmount: monthData.paidAmount,
                    outstandingAmount: monthData.outstandingAmount,
                    isFullyPaid: monthData.isFullyPaid,
                    paymentsCount: monthData.payments.length
                  })
                  
                  if (monthData.payments.length > 0) {
                    console.log('ADMIN DEBUG: Payment details for selected month:', monthData.payments)
                  }
                  
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
                      
                      {monthData.outstandingAmount > 0 && (
                        <div className="flex justify-end">
                          {/* <button
                            onClick={handleSettleMonthlyPayment}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Settle Payment
                          </button> */}
                        </div>
                      )}
                      
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
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {monthData.payments.map(payment => (
                                  <tr key={payment._id}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {new Date(payment.paidDate || payment.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                      ₹{payment.amount.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {payment.paid ? 'Paid' : 'Pending'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {payment.remarks}
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

      {/* Payment Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Record New Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Month</label>
              <select
                name="month"
                value={newPayment.month}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select a month</option>
                {monthlyData
                  .filter(month => !month.isFullyPaid && month.outstandingAmount > 0)
                  .map(month => (
                    <option key={month.key} value={month.key}>
                      {month.month} (Outstanding: ₹{month.outstandingAmount})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hours</label>
              <input
                type="number"
                name="hours"
                value={newPayment.hours}
                onChange={handleInputChange}
                min="1"
                step="0.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={newPayment.amount}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <input
                type="text"
                name="remarks"
                value={newPayment.remarks}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Payment for month..." 
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>

      {/* Payment History */}
<div className="bg-white rounded-lg shadow overflow-hidden">
  <h2 className="text-xl font-semibold p-6 pb-0">All Payment History</h2>
  {payments.length === 0 ? (
    <div className="text-center text-gray-500 py-12">
      No payment records found.
    </div>
  ) : (
    <div className="mt-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => {
            // Get month name from the payment.month field (YYYY-MM format)
            const [year, month] = payment.month.split('-');
            const date = new Date(year, month - 1);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            return (
              <tr key={payment._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {monthYear}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(payment.paidDate || payment.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{payment.hours}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">₹{payment.amount.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {payment.paid ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{payment.remarks || '-'}</div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )}
</div>
    </div>
  )
}

export default AdminTeacherPayments