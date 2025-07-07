import { useState, useEffect } from 'react'
import { teacherService } from '../../services/teacherService'
import { showToast } from '../../utils/toast'
import { Tab } from '@headlessui/react'
import { formatDate } from '../../utils/dateUtils'

const TeacherTests = () => {
  const [tests, setTests] = useState([])
  const [scheduledTests, setScheduledTests] = useState([])
  const [completedTests, setCompletedTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignedClasses, setAssignedClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [activeTab, setActiveTab] = useState(0)
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
    } catch (error) {
      console.error('Error fetching teacher profile:', error)
      showToast.error('Failed to fetch teacher profile')
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
      const allTests = Array.isArray(data) ? data : []
      setTests(allTests)
      
      // Filter tests into scheduled and completed based on test date
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // Scheduled tests are those with test date in the future or today
      const scheduled = allTests.filter(test => {
        const testDate = new Date(test.testDate)
        const testDay = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate())
        return testDay >= today
      })
      
      // Sort scheduled tests by date (earliest first)
      scheduled.sort((a, b) => {
        return new Date(a.testDate) - new Date(b.testDate)
      })
      
      // Completed tests are those with test date in the past
      const completed = allTests.filter(test => {
        const testDate = new Date(test.testDate)
        const testDay = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate())
        return testDay < today
      })
      
      // Sort completed tests by date (most recent first)
      completed.sort((a, b) => {
        return new Date(b.testDate) - new Date(a.testDate)
      })
      
      setScheduledTests(scheduled)
      setCompletedTests(completed)
    } catch (error) {
      console.error('Error fetching tests:', error)
      showToast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const teacherId = localStorage.getItem('userId')
    if (!teacherId) {
      showToast.error('You must be logged in to create tests')
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
        showToast.success('Test deleted successfully')
        fetchTests()
      } catch (error) {
        console.error('Error deleting test:', error)
        showToast.error('Failed to delete test')
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
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1 mb-4">
            <Tab 
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'}`
              }
            >
              Scheduled Tests
            </Tab>
            <Tab 
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'}`
              }
            >
              Completed Tests
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className="space-y-4">
                {scheduledTests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tests scheduled yet.</p>
                ) : (
                  scheduledTests.map((test) => (
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
                            {formatDate(test.testDate)}
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
            </Tab.Panel>
            <Tab.Panel>
              <div className="space-y-4">
                {completedTests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No completed tests found.</p>
                ) : (
                  completedTests.map((test) => (
                    <div key={test._id} className="border rounded-lg p-4 bg-gray-50">
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
                          {test.studentMarks && test.studentMarks.length > 0 && (
                            <p className="text-sm text-green-600 mt-1">
                              {test.studentMarks.length} student(s) graded
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(test.testDate)}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}

export default TeacherTests