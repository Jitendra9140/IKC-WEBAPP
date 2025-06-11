import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { showToast } from '../../utils/toast'
import { useParams } from 'react-router-dom'

const AdminStudentPayments = () => {
  const { studentId } = useParams()
  // Replace the existing studentId prop with this one
  
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [payments, setPayments] = useState([])
  const [newPayment, setNewPayment] = useState({
    installmentNumber: 1,
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    method: 'cash',
    amount: 0, // Add amount field
    remarks: ''
  })

  useEffect(() => {
    fetchStudentAndPayments()
  }, [studentId])

  const fetchStudentAndPayments = async () => {
    try {
      setLoading(true)
      // Fetch student details directly
      const studentResponse = await adminService.getStudentById(studentId)
      setStudent(studentResponse)
      
      // Fetch payment history separately
      const paymentsResponse = await adminService.getStudentPayments(studentId)
      setPayments(paymentsResponse.paymentsByYear)
      console.log(paymentsResponse)
      // Set default amount based on remaining fees
      if (studentResponse && studentResponse.dueFees > 0) {
        setNewPayment(prev => ({
          ...prev,
          amount: studentResponse.dueFees
        }))
      }
    } catch (error) {
      showToast.error( 'Failed to load student data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewPayment(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await adminService.createStudentPayment(studentId, newPayment)
      showToast.success('Payment recorded successfully')
      fetchPayments()
      // Reset form
      setNewPayment({
        installmentNumber: 1,
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        method: 'cash',
        amount: 0,
        remarks: ''
      })
    } catch (error) {
      showToast.error(error.message || 'Failed to record payment')
    }
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

      {/* Payment Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Record New Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Academic Year</label>
              <input
                type="text"
                name="academicYear"
                value={newPayment.academicYear}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Installment Number</label>
              <select
                name="installmentNumber"
                value={newPayment.installmentNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="1">First Installment</option>
                <option value="2">Second Installment</option>
                <option value="3">Third Installment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={newPayment.amount}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="1"
                max={student?.dueFees || 999999}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                name="method"
                value={newPayment.method}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="cash">Cash</option>
                <option value="online">Online Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <input
                type="text"
                name="remarks"
                value={newPayment.remarks}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Optional notes about this payment"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={!student || student.dueFees <= 0 || newPayment.amount <= 0}
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>

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
    </div>
  )
}

export default AdminStudentPayments