import { useState, useEffect } from 'react'
import { teacherService } from '../../services/teacherService'
import { showToast } from '../../utils/toast'

const TeacherSchedule = () => {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignedClasses, setAssignedClasses] = useState([]) // ✅ You missed this
  const [subjects, setSubjects] = useState([]) // ✅ You missed this
  const [newLecture, setNewLecture] = useState({
    class: '',
    section: '',
    subject: '',
    topic: '',
    message: '',
    date: '',
    time: '',
    duration: ''
  })

  useEffect(() => {
    fetchLectures()
  }, [])

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      const teacherId = localStorage.getItem('userId')
      if (!teacherId) {
        console.error('Teacher ID not found in localStorage')
        setLoading(false)
        return
      }

      try {
        const profile = await teacherService.getProfile(teacherId)
        setAssignedClasses(profile.assignedClasses || [])
        setSubjects(profile.subjects || [])
        console.log(profile.subjects)


      } catch (err) {
        console.error('Error fetching teacher profile:', err)
        showToast('Failed to fetch teacher profile', 'error')
      }
    }

    fetchTeacherProfile()
  }, [])

  
console.log(subjects)

  const fetchLectures = async () => {
    try {
      // Get teacherId from localStorage
      const teacherId = localStorage.getItem('userId');
      
      if (!teacherId) {
        console.error('Teacher ID not found in localStorage');
        showToast.error('User ID not found. Please log in again.');
        setLectures([]);
        setLoading(false);
        return;
      }
      
      const data = await teacherService.getLectures(teacherId);
      setLectures(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      showToast.error('Failed to load lectures. Please try again.');
      setLectures([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const teacherId = localStorage.getItem('userId');
    
    if (!token || !teacherId) {
      showToast.error('You must be logged in to create lectures');
      return;
    }
    
    try {
      // Add teacherId to the lecture data and convert duration to number
      const lectureData = {
        ...newLecture,
        teacherId,
        duration: Number(newLecture.duration)
      };
      
      // Using toast.promise to show loading, success, and error states
      await showToast.promise(
        teacherService.createLecture(lectureData),
        {
          pending: 'Creating lecture...',
          success: 'Lecture created successfully!',
          error: 'Failed to create lecture'
        }
      );
      
      // Reset form with matching field names
      setNewLecture({
        class: '',
        section: '',
        subject: '',
        topic: '',
        message: '',
        date: '',
        time: '',
        duration: ''
      });
      fetchLectures();
    } catch (error) {
      console.error('Error creating lecture:', error);
      // Toast error is already shown by the promise handler
    }
  };

  if (loading) return <div>Loading...</div>

  // Get unique class values to prevent duplicates in dropdown
  const uniqueClasses = [...new Set(assignedClasses.map(c => c.class))];

  return (
    <div className="space-y-6 flex flex-row">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Schedule New Lecture</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class</label>
              
              <select
      value={newLecture.class}
      onChange={(e) => setNewLecture({ ...newLecture, class: e.target.value })}
      className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
      required
    >
      <option value="">Select Class</option>
      {uniqueClasses.map((classValue) => (
        <option key={classValue} value={classValue}>
          Class {classValue}
        </option>
      ))}
    </select>
            </div>

            
            {newLecture.class && (
  <div>
    <label className="block text-sm font-medium text-gray-700">Section</label>
    <select
      value={newLecture.section}
      onChange={(e) => setNewLecture({ ...newLecture, section: e.target.value, subject: '' })}
      className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
      required
    >
      <option value="">Select Section</option>
      {[...new Set(
        assignedClasses
          .filter(cls => cls.class === newLecture.class)
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
        value={newLecture.subject}
        onChange={(e) =>
          setNewLecture({ ...newLecture, subject: e.target.value })
        }
        className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
        required
      >
        <option value="">Select Subject</option>
        {subjects.map((subjects) => (
          <option key={subjects} value={subjects}>
            {subjects}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">Topic</label>
      <input
        type="text"
        value={newLecture.topic}
        onChange={(e) => setNewLecture({...newLecture, topic: e.target.value})}
        className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
        placeholder="Enter topic"
      />
    </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={newLecture.date}
                onChange={(e) => setNewLecture({...newLecture, date: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                value={newLecture.time}
                onChange={(e) => setNewLecture({...newLecture, time: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
              <input
                type="number"
                value={newLecture.duration}
                onChange={(e) => setNewLecture({...newLecture, duration: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
                step="0.5"
                min="0.5"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={newLecture.message}
              onChange={(e) => setNewLecture({...newLecture, message: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"
              rows="3"
              placeholder="Enter additional information or instructions"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Schedule Lecture
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 ml-6 flex-1">
        <h2 className="text-xl font-semibold text-black mb-4">Upcoming Lectures</h2>
        <div className="space-y-4">
          {lectures.map((lecture) => (
            <div key={lecture._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {lecture.subject} - Class {lecture.class}
                    {lecture.section && ` ${lecture.section}`}
                  </h3>
                  {lecture.topic && (
                    <p className="text-sm text-gray-800 mt-1">
                      <span className="font-medium">Topic:</span> {lecture.topic}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    Duration: {lecture.duration} hours
                  </p>
                  {lecture.message && (
                    <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                      {lecture.message}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(lecture.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">{lecture.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherSchedule