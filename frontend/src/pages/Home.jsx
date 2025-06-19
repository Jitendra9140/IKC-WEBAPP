import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome to IKC Class
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Your premier platform for quality education and academic excellence
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">For Students</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Access your classes, track your performance, and manage your payments.
                </p>
                <div className="mt-5">
                  <Link
                    to="/student"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Student Dashboard
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">For Teachers</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage your classes, track student attendance, and record marks.
                </p>
                <div className="mt-5">
                  <Link
                    to="/teacher"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Teacher Dashboard
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">For Administrators</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage the entire system, including students, teachers, and payments.
                </p>
                <div className="mt-5">
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Admin Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-base text-gray-500">
            Don't have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home