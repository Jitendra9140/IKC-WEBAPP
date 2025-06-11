import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'

const TeacherRegister = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    subject: '',
    address: '',
    qualifications: '',
    yearsOfExperience: '',
    assignedClasses: [
    ],
    sections: [],
    image: null,
    imagePreview: null
  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    // Format assigned classes with salaryPerHour
    const formattedClasses = [];
    formData.assignedClasses.forEach(classNum => {
      formData.sections.forEach(section => {
        let salaryPerHour = 0;
        if (section === 'Science') salaryPerHour = 200;
        else if (section === 'Commerce') salaryPerHour = 150;
  
        formattedClasses.push({
          class: classNum,
          section,
          salaryPerHour
        });
      });
    });
  
    // Derive subjects from selected sections
    
    try {
      const teacherData = {
        username: formData.email,
        password: formData.password,
        name: formData.fullName,
        phone: formData.phoneNumber,
        address: formData.address,
        subjects: formData.subject,
        assignedClasses: formattedClasses,
        qualifications: formData.qualifications,
        yearsOfExperience: formData.yearsOfExperience
      };
  
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
  
        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: imageFormData
        });
  
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
  
        const uploadResult = await uploadResponse.json();
        teacherData.imageUrl = uploadResult.imageUrl;
      }
  
      await authService.register(teacherData, 'teacher');
      navigate('/teacher');
    } catch (error) {
      setError(error.message);
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClassChange = (classNum) => {
    const updatedClasses = formData.assignedClasses.includes(classNum)
      ? formData.assignedClasses.filter(c => c !== classNum)
      : [...formData.assignedClasses, classNum]
    
    setFormData(prev => ({
      ...prev,
      assignedClasses: updatedClasses
    }))
  }

  const handleSectionChange = (section) => {
    const updatedSections = formData.sections.includes(section)
      ? formData.sections.filter(s => s !== section)
      : [...formData.sections, section]
    
    setFormData(prev => ({
      ...prev,
      sections: updatedSections
    }))
  }

  const handlePaymentRateChange = (classNum, section, value) => {
    setFormData(prev => ({
      ...prev,
      paymentRates: {
        ...prev.paymentRates,
        [`class${classNum}`]: {
          ...prev.paymentRates[`class${classNum}`],
          [section]: value
        }
      }
    }))
  }

  

  const showCommerceInput = (classNum) => {
    return formData.assignedClasses.includes(String(classNum)) && 
           formData.sections.includes('Commerce')
  }

  const inputClassName = "mt-1 block w-full border border-gray-300 rounded-md bg-white text-gray-900 shadow-sm p-2"

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Teacher Registration</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Profile Image</label>
              <div className="mt-1 flex items-center space-x-4">
                {formData.imagePreview && (
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    <img 
                      src={formData.imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className={inputClassName}
                required
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Qualifications</label>
              <input
                type="text"
                name="qualifications"
                placeholder="e.g. B.Sc Mathematics, M.Sc Physics"
                value={formData.qualifications}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Classes Assigned</label>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <label key={i + 1} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.assignedClasses.includes(String(i + 1))}
                    onChange={() => handleClassChange(String(i + 1))}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <span className="ml-2">Class {i + 1}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Sections (for 11th & 12th)</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sections.includes('Science')}
                  onChange={() => handleSectionChange('Science')}
                  className="rounded border-gray-300 text-indigo-600"
                />
                <span className="ml-2">Science</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sections.includes('Commerce')}
                  onChange={() => handleSectionChange('Commerce')}
                  className="rounded border-gray-300 text-indigo-600"
                />
                <span className="ml-2">Commerce</span>
              </label>
            </div>
          </div>

         

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-500"
            >
              Back to Role Selection
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeacherRegister