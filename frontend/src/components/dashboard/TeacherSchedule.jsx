import { useState, useEffect } from 'react'
import { teacherService } from '../../services/teacherService'
import { showToast } from '../../utils/toast'
import { Tab } from '@headlessui/react'
import { formatDate } from '../../utils/dateUtils'

const TeacherSchedule = () => {
  const [lectures, setLectures] = useState([])
  const [upcomingLectures, setUpcomingLectures] = useState([])
  const [completedLectures, setCompletedLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignedClasses, setAssignedClasses] = useState([]) // ✅ You missed this
  const [subjects, setSubjects] = useState([]) // ✅ You missed this
  const [activeTab, setActiveTab] = useState(0)
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
        showToast.error('Failed to fetch teacher profile')
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
        setUpcomingLectures([]);
        setCompletedLectures([]);
        setLoading(false);
        return;
      }
      
      const data = await teacherService.getLectures(teacherId);
      const allLectures = Array.isArray(data) ? data : [];
      setLectures(allLectures);
      
      // Filter lectures into upcoming and completed
      const now = new Date();
      
      // Filter upcoming lectures (future date or today but future time)
      const upcoming = allLectures.filter(lecture => {
        const lectureDate = new Date(lecture.date);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lectureDay = new Date(lectureDate.getFullYear(), lectureDate.getMonth(), lectureDate.getDate());
        
        // If lecture date is in the future
        if (lectureDay > today) return true;
        
        // If lecture is today, check the time
        if (lectureDay.getTime() === today.getTime()) {
          const [lectureHours, lectureMinutes] = lecture.time.split(':').map(Number);
          const lectureTimeInMinutes = lectureHours * 60 + lectureMinutes;
          const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
          
          return lectureTimeInMinutes > currentTimeInMinutes;
        }
        
        return false;
      });
      
      // Sort upcoming lectures by date and time (earliest first)
      upcoming.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
        
        // If same date, sort by time
        const [hoursA, minutesA] = a.time.split(':').map(Number);
        const [hoursB, minutesB] = b.time.split(':').map(Number);
        const timeA = hoursA * 60 + minutesA;
        const timeB = hoursB * 60 + minutesB;
        return timeA - timeB;
      });
      
      // Completed lectures are those not in upcoming
      const completed = allLectures.filter(lecture => {
        return !upcoming.some(upcomingLecture => upcomingLecture._id === lecture._id);
      });
      
      // Sort completed lectures by date and time (most recent first)
      completed.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) return dateB - dateA;
        
        // If same date, sort by time (latest first)
        const [hoursA, minutesA] = a.time.split(':').map(Number);
        const [hoursB, minutesB] = b.time.split(':').map(Number);
        const timeA = hoursA * 60 + minutesA;
        const timeB = hoursB * 60 + minutesB;
        return timeB - timeA;
      });
      
      setUpcomingLectures(upcoming);
      setCompletedLectures(completed);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      showToast.error('Failed to load lectures. Please try again.');
      setLectures([]);
      setUpcomingLectures([]);
      setCompletedLectures([]);
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
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1 mb-4">
            <Tab 
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'}`
              }
            >
              Upcoming Lectures
            </Tab>
            <Tab 
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'}`
              }
            >
              Completed Lectures
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className="space-y-4">
                {upcomingLectures.length > 0 ? (
                  upcomingLectures.map((lecture) => (
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
                            {formatDate(lecture.date)}
                          </p>
                          <p className="text-sm text-gray-600">{lecture.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming lectures scheduled
                  </div>
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="space-y-4">
                {completedLectures.length > 0 ? (
                  completedLectures.map((lecture) => (
                    <div key={lecture._id} className="border rounded-lg p-4 bg-gray-50">
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
                            <p className="text-sm text-gray-700 mt-2 bg-gray-100 p-2 rounded">
                              {lecture.message}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(lecture.date)}
                          </p>
                          <p className="text-sm text-gray-600">{lecture.time}</p>
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No completed lectures found
                  </div>
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}

export default TeacherSchedule

      