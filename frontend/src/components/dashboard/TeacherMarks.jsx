import { useState, useEffect } from 'react'
import { teacherService } from '../../services/teacherService'
import { showToast } from '../../utils/toast'


const TeacherMarks = () => {
  const [tests, setTests] = useState([])
  const [students, setStudents] = useState([])
  const [selectedTest, setSelectedTest] = useState('')
  const [selectedStudents, setSelectedStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [marksData, setMarksData] = useState([])
  const [testsWithMarks, setTestsWithMarks] = useState([])
  const [unmarkedTests, setUnmarkedTests] = useState([])

  useEffect(() => {
    fetchTests()
    fetchStudents()
  }, [])

  const fetchTests = async () => {
    try {
      const teacherId = localStorage.getItem('userId')
      if (!teacherId) {
        console.error('Teacher ID not found in localStorage')
        setLoading(false)
        return
      }

      const data = await teacherService.getTests(teacherId)
      const allTests = Array.isArray(data) ? data : []
      setTests(allTests)
      
      // Separate tests with marks from unmarked tests
      const withMarks = []
      const withoutMarks = []
      
      for (const test of allTests) {
        if (test.studentMarks && test.studentMarks.length > 0) {
          withMarks.push(test)
        } else {
          withoutMarks.push(test)
        }
      }
      
      setTestsWithMarks(withMarks)
      setUnmarkedTests(withoutMarks)
    } catch (error) {
      console.error('Error fetching tests:', error)
      showToast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const teacherId = localStorage.getItem('userId')
      if (!teacherId) {
        console.error('Teacher ID not found in localStorage')
        return
      }

      const data = await teacherService.getStudents(teacherId)
      setStudents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching students:', error)
      showToast.error('Failed to load students')
    }
  }

  // Update the handleTestChange function
  const handleTestChange = async (e) => {
    const testId = e.target.value
    setSelectedTest(testId)
    
    if (!testId) {
      setSelectedStudents([])
      setMarksData([])
      return
    }
    
    try {
      // Find the selected test to get class and section
      const test = tests.find(t => t._id === testId)
      if (!test) return
      
      // Filter students by class and section (case-insensitive comparison for section)
      const filteredStudents = students.filter(
        student => student.class === test.class && 
                   student.section.toLowerCase() === test.section.toLowerCase()
      )
      
      setSelectedStudents(filteredStudents)
      
      // Initialize marks data for each student
      let initialMarksData = filteredStudents.map(student => ({
        studentId: student._id,
        studentName: student.name,
        marksObtained: '',
        teacherRemarks: ''
      }))
      
      // If test already has student marks, use those values
      if (test.studentMarks && test.studentMarks.length > 0) {
        initialMarksData = initialMarksData.map(mark => {
          const existingMark = test.studentMarks.find(m => m.studentId === mark.studentId)
          if (existingMark) {
            return {
              ...mark,
              marksObtained: existingMark.marksObtained.toString(),
              teacherRemarks: existingMark.teacherRemarks || ''
            }
          }
          return mark
        })
        showToast('Loaded existing marks', 'info')
      }
      
      setMarksData(initialMarksData)
    } catch (error) {
      console.error('Error setting up marks form:', error)
      showToast.error('Failed to set up marks form')
    }
  }

  const handleMarksChange = (studentId, field, value) => {
    setMarksData(prevData => 
      prevData.map(mark => 
        mark.studentId === studentId 
          ? { ...mark, [field]: value } 
          : mark
      )
    )
  }

  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Find the selected test
    const test = tests.find(t => t._id === selectedTest)
    if (!test) {
      showToast.error('Test not found', 'error')
      return
    }
    
    // Validate marks
    const invalidMarks = marksData.filter(mark => {
      const obtained = Number(mark.marksObtained)
      return isNaN(obtained) || obtained < 0 || obtained > test.totalMarks
    })
    
    if (invalidMarks.length > 0) {
      showToast.error('Some marks are invalid. Please check your entries.')
      return
    }
    console.log(marksData)
    // Filter out empty marks and convert string values to numbers
    const validMarksData = marksData
      .filter(mark => mark.marksObtained !== '')
      .map(mark => ({
        ...mark,
        marksObtained: Number(mark.marksObtained)
      }))
    
    try {
      // Submit all marks at once
      const response = await teacherService.updateTestMarks(test._id, validMarksData)
      
      if (response.message && response.message.includes('error')) {
        throw new Error(response.message)
      }
      
      showToast.success('Marks saved successfully!',)
      
      // Update the local tests array with the new marks
      setTests(prevTests => 
        prevTests.map(t => 
          t._id === test._id 
            ? { ...t, studentMarks: validMarksData } 
            : t
        )
      )
      
      // Refresh the tests to update which ones have marks
      await fetchTests()
      
      // Reset the form
      setSelectedTest('')
      setSelectedStudents([])
      setMarksData([])
    } catch (error) {
      showToast.error(`Failed to save marks: ${error.message}`)
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800">Add Student Marks</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Test</label>
          <select
            value={selectedTest}
            onChange={handleTestChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a Test</option>
            {unmarkedTests.map(test => (
              <option key={test._id} value={test._id}>
                {test.subject} - Class {test.class} {test.section} - {new Date(test.testDate).toLocaleDateString()}
              </option>
            ))}
          </select>
          {unmarkedTests.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">All tests have marks added.</p>
          )}
        </div>
        
        {selectedTest && selectedStudents.length > 0 && (
          <form onSubmit={handleSubmit}>
            {/* Get the test object from the tests array using selectedTest ID */}
            {(() => {
              const test = tests.find(t => t._id === selectedTest);
              return (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedStudents.map(student => {
                      const studentMark = marksData.find(mark => mark.studentId === student._id) || {
                        marksObtained: '',
                        teacherRemarks: ''
                      }
                      
                      return (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img 
                                  className="h-10 w-10 rounded-full" 
                                  src={student.imageUrl}
                                  alt={student.name} 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">Class {student.class} {student.section}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              max={test.totalMarks}
                              value={studentMark.marksObtained}
                              onChange={(e) => handleMarksChange(student._id, 'marksObtained', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {test.totalMarks}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <textarea
                              value={studentMark.teacherRemarks}
                              onChange={(e) => handleMarksChange(student._id, 'teacherRemarks', e.target.value)}
                              placeholder="Add remarks here..."
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              rows="2"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            })()} {/* Immediately invoke the function */}
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Save Marks
              </button>
            </div>
          </form>
        )}
        
        {selectedTest && selectedStudents.length === 0 && (
          <div className="text-center py-4">
            No students found for this test's class and section.
          </div>
        )}
      </div>
      
      {/* Test Marks Summary Section */}
      {testsWithMarks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Test Marks Summary</h2>
          <div className="space-y-6">
            {testsWithMarks.map(test => {
              const totalStudents = test.studentMarks.length;
              const totalMarksSum = test.studentMarks.reduce((sum, mark) => sum + mark.marksObtained, 0);
              const averageMarks = totalStudents > 0 ? Math.round(totalMarksSum / totalStudents) : 0;
              const highestMark = totalStudents > 0 ? Math.max(...test.studentMarks.map(mark => mark.marksObtained)) : 0;
              const lowestMark = totalStudents > 0 ? Math.min(...test.studentMarks.map(mark => mark.marksObtained)) : 0;
              const passPercentage = totalStudents > 0 ? 
                Math.round((test.studentMarks.filter(mark => mark.marksObtained >= (test.totalMarks * 0.33)).length / totalStudents) * 100) : 0;
              
              return (
                <div key={test._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{test.subject}</h3>
                      <p className="text-sm text-gray-500">
                        Class {test.class} {test.section} • {formatDate(test.testDate)} • Topic: {test.topic}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">Pass Rate</div>
                      <div className={`text-lg font-bold ${passPercentage >= 80 ? 'text-green-600' : passPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {passPercentage}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="bg-blue-100 rounded-full px-3 py-1 text-sm text-blue-800">
                      Average: {averageMarks}/{test.totalMarks}
                    </div>
                    <div className="bg-green-100 rounded-full px-3 py-1 text-sm text-green-800">
                      Highest: {highestMark}/{test.totalMarks}
                    </div>
                    <div className="bg-red-100 rounded-full px-3 py-1 text-sm text-red-800">
                      Lowest: {lowestMark}/{test.totalMarks}
                    </div>
                    <div className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-800">
                      Total Students: {totalStudents}
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
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {test.studentMarks.map(mark => (
                              <tr key={mark.studentId}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {mark.studentName}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    mark.marksObtained >= (test.totalMarks * 0.33) 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {mark.marksObtained}/{test.totalMarks}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {mark.teacherRemarks || '-'}
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

export default TeacherMarks