import { useState, useEffect } from 'react'
import { studentService } from '../../services/studentService'

const StudentPayments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [stats, setStats] = useState({
    totalFees: 0,
    paidAmount: 0,
    pendingAmount: 0,
    nextDueDate: null
  })

  useEffect(() => {
    fetchStudentAndPayments()
  }, [])

  const fetchStudentAndPayments = async () => {
    try {
      setLoading(true)
      const studentId = localStorage.getItem('userId')
      if (!studentId) {
        throw new Error('Student ID not found. Please log out and log in again.')
      }
      
      // Fetch student profile
      const studentProfile = await studentService.getProfile(studentId)
      setStudent(studentProfile)
      
      // Fetch payment history
      const paymentsResponse = await studentService.getPayments(studentId)
      setPayments(paymentsResponse.paymentsByYear || [])
      
      // Calculate next due date if there are pending payments
      let nextDueDate = null
      if (paymentsResponse.paymentsByYear && paymentsResponse.paymentsByYear.length > 0) {
        // Find the first year with remaining amount
        const yearWithPending = paymentsResponse.paymentsByYear.find(year => year.remainingAmount > 0)
        if (yearWithPending) {
          // Find the first pending installment
          const pendingInstallment = yearWithPending.installments.find(inst => inst.status === 'pending')
          if (pendingInstallment) {
            nextDueDate = new Date(pendingInstallment.date)
          }
        }
      }
      
      // Set payment stats
      setStats({
        totalFees: studentProfile.overallFees || 0,
        paidAmount: studentProfile.paidFees || 0,
        pendingAmount: studentProfile.dueFees || 0,
        nextDueDate: nextDueDate
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Fee Payments</h2>

      {/* Student Information */}
      {student && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-medium">{student.class} {student.section}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall Fees</p>
              <p className="font-medium">₹{student.overallFees?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid Fees</p>
              <p className="font-medium text-green-600">₹{student.paidFees?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Fees</p>
              <p className="font-medium text-red-600">₹{student.dueFees?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className={`font-medium ${student.dueFees > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {student.dueFees > 0 ? 'Pending' : 'Fully Paid'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6 pb-0">Payment History</h2>
        {!payments || payments.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No payment records found.
          </div>
        ) : (
          <div className="mt-4">
            {payments.map((yearData, index) => (
              <div key={index} className="border-t border-gray-200">
                <div className="bg-gray-50 px-6 py-3">
                  <h3 className="text-lg font-medium">
                    Academic Year: {yearData.academicYear}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-500">Total Fees</p>
                      <p className="font-medium">₹{yearData.totalFees.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Paid Amount</p>
                      <p className="font-medium text-green-600">₹{yearData.paidAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining Amount</p>
                      <p className="font-medium text-red-600">₹{yearData.remainingAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {yearData.installments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.installmentNumber} of {payment.totalInstallments}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(payment.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{payment.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{payment.method}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.remarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Instructions</h3>
        <div className="space-y-2 text-gray-700">
          <p>1. All payments should be made before the due date to avoid late fees.</p>
          <p>2. Payments can be made through online transfer or at the institute office.</p>
          <p>3. For online transfers, please use the following details:</p>
          <div className="pl-6 mt-2">
            <p><span className="font-medium">Bank Name:</span> IKC Bank</p>
            <p><span className="font-medium">Account Number:</span> 1234567890</p>
            <p><span className="font-medium">IFSC Code:</span> IKC0001234</p>
            <p><span className="font-medium">Account Name:</span> IKC Classes</p>
          </div>
          <p className="mt-2">4. After making the payment, please inform the office with the transaction details.</p>
        </div>
      </div>
    </div>
  )
}

export default StudentPayments