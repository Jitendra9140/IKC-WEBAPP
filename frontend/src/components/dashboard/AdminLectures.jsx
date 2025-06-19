import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'

const AdminLectures = () => {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    classLevel: '',
    section: '',
    subject: ''
  })
  
  // Categorized lectures
  const [categorizedLectures, setCategorizedLectures] = useState({
    tomorrow: [],
    today: [],
    recent: []
  })

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    subjects: [],
    sections: []
  })

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        // First fetch all lectures to get filter options
        if (filterOptions.subjects.length === 0 || filterOptions.sections.length === 0) {
          console.log('Fetching all lectures for filter options');
          const allData = await adminService.getLectures({});
          extractFilterOptions(allData);
        }
        
        // Then fetch filtered lectures
        console.log('Fetching lectures with filters:', filters);
        const data = await adminService.getLectures(filters);
        console.log('Fetched lectures:', data.length);
        setLectures(data);
        categorizeLectures(data);
      } catch (err) {
        setError('Failed to load lectures');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, [filters, filterOptions.subjects.length, filterOptions.sections.length]);

  // Extract unique subjects and sections from lecture data
  const extractFilterOptions = (lectureData) => {
    console.log('Extracting filter options from', lectureData.length, 'lectures');
    const subjects = new Set();
    const sections = new Set();

    lectureData.forEach(lecture => {
      if (lecture.subject) subjects.add(lecture.subject);
      if (lecture.section) sections.add(lecture.section);
    });

    const sortedSubjects = Array.from(subjects).sort();
    const sortedSections = Array.from(sections).sort();
    
    console.log('Found subjects:', sortedSubjects);
    console.log('Found sections:', sortedSections);
    
    setFilterOptions({
      subjects: sortedSubjects,
      sections: sortedSections
    });
  };

  // Function to categorize lectures based on date
  const categorizeLectures = (lectureData) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to beginning of day for accurate comparison
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const categorized = {
      tomorrow: [],
      today: [],
      recent: []
    }
    
    lectureData.forEach(lecture => {
      const lectureDate = new Date(lecture.date)
      lectureDate.setHours(0, 0, 0, 0) // Set to beginning of day for accurate comparison
      
      if (lectureDate.getTime() === tomorrow.getTime()) {
        categorized.tomorrow.push(lecture)
      } else if (lectureDate.getTime() === today.getTime()) {
        categorized.today.push(lecture)
      } else if (lectureDate < today) {
        categorized.recent.push(lecture)
      }
    })
    
    // Sort recent lectures by date (most recent first)
    categorized.recent.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // Sort today's and tomorrow's lectures by time
    const sortByTime = (a, b) => {
      const timeA = a.time.split(':').map(Number)
      const timeB = b.time.split(':').map(Number)
      
      if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0]
      return timeA[1] - timeB[1]
    }
    
    categorized.today.sort(sortByTime)
    categorized.tomorrow.sort(sortByTime)
    
    setCategorizedLectures(categorized)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) return <div className="text-center py-10">Loading lectures...</div>
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>

  // Function to render lecture table
  const renderLectureTable = (lectureList, emptyMessage) => {
    if (lectureList.length === 0) {
      return <div className="text-center py-5 text-gray-500">{emptyMessage}</div>
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {lectureList.map(lecture => (
              <tr key={lecture._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lecture.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lecture.teacherId?.name || lecture.teacherName || 'Unknown Teacher'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lecture.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lecture.section}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(lecture.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lecture.time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lecture.duration} hr</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lectures</h1>
        <div className="flex space-x-4">
          <select
            name="classLevel"
            value={filters.classLevel}
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
            {filterOptions.sections.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
          
          <select
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">All Subjects</option>
            {filterOptions.subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {lectures.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No lectures found matching the criteria</div>
      ) : (
        <div className="space-y-8">
          {/* Tomorrow's Lectures */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tomorrow's Lectures</h2>
            {renderLectureTable(categorizedLectures.tomorrow, "No lectures scheduled for tomorrow")}
          </div>
          
          {/* Today's Lectures */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Lectures</h2>
            {renderLectureTable(categorizedLectures.today, "No lectures scheduled for today")}
          </div>
          
          {/* Recent Lectures */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Lectures</h2>
            {renderLectureTable(categorizedLectures.recent, "No recent lectures found")}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLectures