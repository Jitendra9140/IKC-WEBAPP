import { useState, useEffect } from 'react'
import { teacherService } from '../../services/teacherService'
import { showToast } from '../../utils/toast'

const TeacherTests = () => {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignedClasses, setAssignedClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [newTest, setNewTest] = useState({
    class: '',
    section: '',
    subject: '',
    testDate: '',
    optionalSubject: '',
    topic: '',
    totalMarks: '100'
  })

  useEffect(() => {
    fetchTests()
    fetchTeacherProfile()
  }, [])

  const fetchTeacherProfile = async () => {
    try {
      const teacherId = localStorage.getItem('userId')
      if (!teacherId) {
        console.error('Teacher ID not found in localStorage')
        setLoading(false)
        return
      }

      const profile = await teacherService.getProfile(teacherId)
      setAssignedClasses(profile.assignedClasses || [])
      setSubjects(profile.subjects || [])
    } catch (err) {
      console.error('Error fetching teacher profile:', err)
      showToast('Failed to fetch teacher profile', 'error')
    }
  }

  const fetchTests = async () => {
    try {
      const teacherId = localStorage.getItem('userId')
      if (!teacherId) {
        console.error('Teacher ID not found in localStorage')
        setLoading(false)
        return
      }

      const data = await teacherService.getTests(teacherId)
      setTests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching tests:', error)
      showToast('Failed to load tests', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const teacherId = localStorage.getItem('userId')
    if (!teacherId) {
      showToast('You must be logged in to create tests', 'error')
      return
    }
    
    try {
      const testData = {
        ...newTest,
        teacherId,
        // Convert section to lowercase to match the enum values in the model
        section: newTest.section.toLowerCase(),
        // Set optionalSubject to null if it's an empty string
        optionalSubject: newTest.optionalSubject || null,
        testDate: new Date(newTest.testDate),
        totalMarks: Number(newTest.totalMarks)
      }
      
      await showToast.promise(
        teacherService.createTest(testData),
        {
          pending: 'Creating test...',
          success: 'Test created successfully!',
          error: 'Failed to create test'
        }
      )
      
      setNewTest({
        class: '',
        section: '',
        subject: '',
        testDate: '',
        optionalSubject: '',
        topic: '',
        totalMarks: '100'
      })
      
      fetchTests()
    } catch (error) {
      console.error('Error creating test:', error)
    }
  }

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await teacherService.deleteTest(testId)
        showToast('Test deleted successfully', 'success')
        fetchTests()
      } catch (error) {
        console.error('Error deleting test:', error)
        showToast('Failed to delete test', 'error')
      }
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6 flex flex-row">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Schedule New Test</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <select
                value={newTest.class}
                onChange={(e) => setNewTest({ ...newTest, class: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
                required
              >
                <option value="">Select Class</option>
                {[...new Set(assignedClasses.map(c => c.class))].map((classValue) => (
                  <option key={classValue} value={classValue}>
                    Class {classValue}
                  </option>
                ))}
              </select>
            </div>

            {newTest.class && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <select
                  value={newTest.section}
                  onChange={(e) => setNewTest({ ...newTest, section: e.target.value, subject: '' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
                  required
                >
                  <option value="">Select Section</option>
                  {[...new Set(
                    assignedClasses
                      .filter(cls => cls.class === newTest.class)
                      .map(cls => cls.section)
                  )].map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select
                value={newTest.subject}
                onChange={(e) => setNewTest({ ...newTest, subject: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {(newTest.section === 'science') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Optional Subject</label>
                <select
                  value={newTest.optionalSubject}
                  onChange={(e) => setNewTest({ ...newTest, optionalSubject: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
                >
                  <option value="">None</option>
                  <option value="maths">Mathematics</option>
                  <option value="biology">Biology</option>
                  <option value="sp">Sports</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Test Date</label>
              <input
                type="date"
                value={newTest.testDate}
                onChange={(e) => setNewTest({ ...newTest, testDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
                required
              />
            </div>

            {/* Add these new fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Topic</label>
              <input
                type="text"
                value={newTest.topic}
                onChange={(e) => setNewTest({ ...newTest, topic: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
                required
                placeholder="Enter test topic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Marks</label>
              <input
                type="number"
                min="1"
                value={newTest.totalMarks}
                onChange={(e) => setNewTest({ ...newTest, totalMarks: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Schedule Test
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 ml-6 flex-1">
        <h2 className="text-xl font-semibold text-black mb-4">Scheduled Tests</h2>
        <div className="space-y-4">
          {tests.length === 0 ? (
            <p className="text-gray-500">No tests scheduled yet.</p>
          ) : (
            tests.map((test) => (
              <div key={test._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {test.subject} - Class {test.class} {test.section}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Topic: {test.topic || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total Marks: {test.totalMarks || 100}
                    </p>
                    {test.optionalSubject && (
                      <p className="text-sm text-gray-600">
                        Optional: {test.optionalSubject}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(test.testDate).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDeleteTest(test._id)}
                      className="text-red-600 text-sm mt-2 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherTests