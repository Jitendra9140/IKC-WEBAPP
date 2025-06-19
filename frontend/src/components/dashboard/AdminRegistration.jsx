import { useState } from 'react'
import { adminService } from '../../services/adminService'
import { showToast } from '../../utils/toast'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
const API_URL = import.meta.env.VITE_API_URL + '/api'

const AdminRegistration = () => {
  const [activeTab, setActiveTab] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showStudentPassword, setShowStudentPassword] = useState(false)
  const [showStudentConfirmPassword, setShowStudentConfirmPassword] = useState(false)
  const [showTeacherPassword, setShowTeacherPassword] = useState(false)
  const [showTeacherConfirmPassword, setShowTeacherConfirmPassword] = useState(false)
  
  // Student form state
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    parentPhone: '',
    address: '',
    schoolCollegeName: '',
    class: '',
    section: '',
    gender: '',
    dateOfBirth: '',
    tenthPercentage: '',
    tenthBoard: '',
    tenthPassingYear: '',
    image: null,
    imagePreview: null
  })
  
  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    subject: '',
    address: '',
    qualifications: '',
    yearsOfExperience: '',
    assignedClasses: [],
    sections: [],
    image: null,
    imagePreview: null
  })
  
  const [showAdditionalFields, setShowAdditionalFields] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState([])
  
  // Handle student form change
  const handleStudentChange = (e) => {
    const { name, value } = e.target
    setStudentForm(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user types
    
    // Show additional fields for 11th and 12th class students
    if (name === 'class') {
      setShowAdditionalFields(['11', '12'].includes(value))
    }
  }
  
  // Handle image upload for student
  const handleStudentImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setStudentForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }))
    }
  }
  
  // Handle teacher form change
  const handleTeacherChange = (e) => {
    const { name, value } = e.target
    setTeacherForm(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user types
  }
  
  // Handle image upload for teacher
  const handleTeacherImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setTeacherForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }))
    }
  }
  
  // Handle class selection for teacher
  const handleClassChange = (classNum) => {
    const updatedClasses = teacherForm.assignedClasses.includes(classNum)
      ? teacherForm.assignedClasses.filter(c => c !== classNum)
      : [...teacherForm.assignedClasses, classNum]
    
    setTeacherForm(prev => ({
      ...prev,
      assignedClasses: updatedClasses
    }))
  }
  
  // Handle section selection for teacher
  const handleSectionChange = (section) => {
    const updatedSections = teacherForm.sections.includes(section)
      ? teacherForm.sections.filter(s => s !== section)
      : [...teacherForm.sections, section]
    
    setTeacherForm(prev => ({
      ...prev,
      sections: updatedSections,
      subject: '' // Reset subject when section changes
    }))
    
    // Update available subjects based on selected sections
    setTimeout(() => {
      let subjects = []
      if (updatedSections.includes('Science')) {
        subjects = [...subjects, 'Chemistry', 'Physics', 'Maths']
      }
      if (updatedSections.includes('Commerce')) {
        subjects = [...subjects, 'Maths', 'BK (Book Keeping)', 'Economics', 'SP (Secretarial Practice)', 'OCM (Organisation of Commerce and Management)']
      }
      setAvailableSubjects([...new Set(subjects)]) // Remove duplicates
    }, 0)
  }
  
  // Validate student form
  const validateStudentForm = () => {
    if (studentForm.password !== studentForm.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (studentForm.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (!studentForm.phoneNumber.match(/^\d{10}$/)) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }

    if (!studentForm.parentPhone.match(/^\d{10}$/)) {
      setError('Please enter a valid 10-digit parent phone number')
      return false
    }

    if (!studentForm.image) {
      setError('Please upload a profile image')
      return false
    }

    return true
  }
  
  // Validate teacher form
  const validateTeacherForm = () => {
    if (teacherForm.password !== teacherForm.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (teacherForm.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (!teacherForm.phoneNumber.match(/^\d{10}$/)) {
      setError('Please enter a valid 10-digit phone number')
      return false
    }
    
    if (teacherForm.assignedClasses.length === 0) {
      setError('Please select at least one class')
      return false
    }
    
    if (teacherForm.sections.length === 0) {
      setError('Please select at least one section')
      return false
    }

    if (!teacherForm.image) {
      setError('Please upload a profile image')
      return false
    }

    return true
  }
  
  // Upload image and get URL
  const uploadImage = async (image) => {
    if (!image) {
      console.error('No image provided for upload')
      throw new Error('No image provided for upload')
    }
    
    const formData = new FormData()
    formData.append('image', image)
    
    try {
      console.log('Uploading image to server...')
      // Change this URL to point to your backend server
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Image upload failed:', errorText)
        throw new Error(`Image upload failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.imageUrl) {
        console.error('No image URL returned from server:', data)
        throw new Error('Server did not return an image URL')
      }
      
      console.log('Image uploaded successfully:', data.imageUrl)
      return data.imageUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }
  
  // Handle student registration
  const handleStudentSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!validateStudentForm()) {
      setLoading(false)
      return
    }

    try {
      // Upload image (required)
      let imageUrl = null
      try {
        imageUrl = await uploadImage(studentForm.image)
        if (!imageUrl) {
          throw new Error('Failed to upload image')
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError)
        setError('Image upload failed. Please try again.')
        setLoading(false)
        return
      }
      
      // Set paid fees to 0 during registration
      // Overall fees will be calculated on the backend based on class and section
      const paidFees = 0
      
      const studentData = {
        username: studentForm.email,
        password: studentForm.password,
        role: 'student',
        name: studentForm.fullName,
        phone: studentForm.phoneNumber,
        parentPhone: studentForm.parentPhone,
        address: studentForm.address,
        schoolOrCollegeName: studentForm.schoolCollegeName,
        class: studentForm.class,
        section: studentForm.section,
        gender: studentForm.gender,
        dob: new Date(studentForm.dateOfBirth).toISOString(),
        paidFees: paidFees,
        imageUrl: imageUrl // Always include imageUrl
      }

      // Add optional fields for 11th and 12th class students
      if (showAdditionalFields) {
        studentData.tenthPercentage = parseFloat(studentForm.tenthPercentage)
        studentData.tenthBoard = studentForm.tenthBoard
        studentData.tenthPassingYear = parseInt(studentForm.tenthPassingYear)
      }

      // Add the registerStudent method to adminService
      await adminService.registerStudent(studentData)
      showToast.success('Student registered successfully')
      
      // Reset form
      setStudentForm({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        parentPhone: '',
        address: '',
        schoolCollegeName: '',
        class: '',
        section: '',
        gender: '',
        dateOfBirth: '',
        tenthPercentage: '',
        tenthBoard: '',
        tenthPassingYear: '',
        image: null,
        imagePreview: null
      })
    } catch (err) {
        showToast.error(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle teacher registration
  const handleTeacherSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!validateTeacherForm()) {
      setLoading(false)
      return
    }

    try {
      // Upload image (required)
      let imageUrl = null
      try {
        imageUrl = await uploadImage(teacherForm.image)
        if (!imageUrl) {
          throw new Error('Failed to upload image')
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError)
        setError('Image upload failed. Please try again.')
        setLoading(false)
        return
      }
      
      // Format assigned classes with salaryPerHour
      const formattedClasses = []
      teacherForm.assignedClasses.forEach(classNum => {
        teacherForm.sections.forEach(section => {
          let salaryPerHour = 0
          if (section === 'Science') salaryPerHour = 200
          else if (section === 'Commerce') salaryPerHour = 150

          formattedClasses.push({
            class: classNum,
            section,
            salaryPerHour
          })
        })
      })

      const teacherData = {
        username: teacherForm.email,
        password: teacherForm.password,
        role: 'teacher',
        name: teacherForm.fullName,
        phone: teacherForm.phoneNumber,
        address: teacherForm.address,
        subjects: teacherForm.subject,
        assignedClasses: formattedClasses,
        qualifications: teacherForm.qualifications,
        yearsOfExperience: teacherForm.yearsOfExperience,
        imageUrl: imageUrl // Always include imageUrl
      }

      // Add the registerTeacher method to adminService
      await adminService.registerTeacher(teacherData)
      showToast.success('Teacher registered successfully')
      
      // Reset form
      setTeacherForm({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        subject: '',
        address: '',
        qualifications: '',
        yearsOfExperience: '',
        assignedClasses: [],
        sections: [],
        image: null,
        imagePreview: null
      })
    } catch (err) {
        showToast.error(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Register New User</h2>
      
      {/* Tab navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'student' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('student')}
        >
          Student Registration
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'teacher' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('teacher')}
        >
          Teacher Registration
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Student registration form */}
      {activeTab === 'student' && (
        <form onSubmit={handleStudentSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={studentForm.fullName}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              {/* Image Upload */}
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Student Image <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStudentImageChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                {studentForm.imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={studentForm.imagePreview} 
                      alt="Preview" 
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Email (Username)</label>
                <input
                  type="email"
                  name="email"
                  value={studentForm.email}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showStudentPassword ? "text" : "password"}
                    name="password"
                    value={studentForm.password}
                    onChange={handleStudentChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                  >
                    {showStudentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showStudentConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={studentForm.confirmPassword}
                    onChange={handleStudentChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowStudentConfirmPassword(!showStudentConfirmPassword)}
                  >
                    {showStudentConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={studentForm.phoneNumber}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Parent's Phone Number</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={studentForm.parentPhone}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={studentForm.address}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Academic Information */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">School/College Name</label>
                <input
                  type="text"
                  name="schoolCollegeName"
                  value={studentForm.schoolCollegeName}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Class</label>
                <select
                  name="class"
                  value={studentForm.class}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Class</option>
                  <option value="11">11th</option>
                  <option value="12">12th</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Section</label>
                <select
                  name="section"
                  value={studentForm.section}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Section</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={studentForm.dateOfBirth}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={studentForm.gender}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {/* Fee fields removed - fees are now determined by class and section */}
            </div>
          </div>
          
          {/* Additional fields for 11th and 12th class students */}
          {showAdditionalFields && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3">10th Standard Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">10th Percentage</label>
                  <input
                    type="number"
                    name="tenthPercentage"
                    value={studentForm.tenthPercentage}
                    onChange={handleStudentChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required={showAdditionalFields}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">10th Board</label>
                  <input
                    type="text"
                    name="tenthBoard"
                    value={studentForm.tenthBoard}
                    onChange={handleStudentChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required={showAdditionalFields}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">10th Passing Year</label>
                  <input
                    type="number"
                    name="tenthPassingYear"
                    value={studentForm.tenthPassingYear}
                    onChange={handleStudentChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required={showAdditionalFields}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>
      )}
      
      {/* Teacher registration form */}
      {activeTab === 'teacher' && (
        <form onSubmit={handleTeacherSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={teacherForm.fullName}
                  onChange={handleTeacherChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              
              {/* Image Upload */}
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Teacher Image <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTeacherImageChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                {teacherForm.imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={teacherForm.imagePreview} 
                      alt="Preview" 
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Email (Username)</label>
                <input
                  type="email"
                  name="email"
                  value={teacherForm.email}
                  onChange={handleTeacherChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showTeacherPassword ? "text" : "password"}
                    name="password"
                    value={teacherForm.password}
                    onChange={handleTeacherChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                  >
                    {showTeacherPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showTeacherConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={teacherForm.confirmPassword}
                    onChange={handleTeacherChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowTeacherConfirmPassword(!showTeacherConfirmPassword)}
                  >
                    {showTeacherConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={teacherForm.phoneNumber}
                  onChange={handleTeacherChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={teacherForm.address}
                  onChange={handleTeacherChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Professional Information */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Subject</label>
                <select
                  name="subject"
                  value={teacherForm.subject}
                  onChange={handleTeacherChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={teacherForm.sections.length === 0}
                >
                  <option value="">Select Subject</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                {teacherForm.sections.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">Please select at least one section first</p>
                )}
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Qualifications</label>
                <input
                  type="text"
                  name="qualifications"
                  value={teacherForm.qualifications}
                  onChange={handleTeacherChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={teacherForm.yearsOfExperience}
                  onChange={handleTeacherChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Class and Section Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Assigned Classes</h3>
              <div className="flex flex-wrap gap-2">
                {['11', '12'].map(classNum => (
                  <button
                    key={classNum}
                    type="button"
                    onClick={() => handleClassChange(classNum)}
                    className={`px-4 py-2 rounded-md ${teacherForm.assignedClasses.includes(classNum) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    Class {classNum}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Assigned Sections</h3>
              <div className="flex flex-wrap gap-2">
                {['Science', 'Commerce'].map(section => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => handleSectionChange(section)}
                    className={`px-4 py-2 rounded-md ${teacherForm.sections.includes(section) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Teacher'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default AdminRegistration