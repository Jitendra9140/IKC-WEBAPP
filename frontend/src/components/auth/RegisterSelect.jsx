import { useNavigate } from 'react-router-dom'

const RegisterSelect = () => {
  const navigate = useNavigate()

  const roles = [
    { id: 'student', title: 'Student', icon: '👨‍🎓', bgColor: 'bg-blue-50 hover:bg-blue-100', borderColor: 'border-blue-200' },
    { id: 'teacher', title: 'Teacher', icon: '👨‍🏫', bgColor: 'bg-green-50 hover:bg-green-100', borderColor: 'border-green-200' }
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Register as</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(`/register/${role.id}`)}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ${role.bgColor} ${role.borderColor}`}
            >
              <span className="text-4xl mb-3">{role.icon}</span>
              <span className="text-sm font-medium text-gray-900">{role.title}</span>
            </button>
          ))}
        </div>

        <div className="text-center text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-semibold text-indigo-600 bg-white hover:text-indigo-500"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterSelect