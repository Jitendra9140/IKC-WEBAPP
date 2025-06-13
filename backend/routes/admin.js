const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controller/adminController');

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admin only.' });
};

// @route   GET api/admin/teachers
// @desc    Get all teachers with optional filters
router.get('/teachers', [auth, adminAuth], adminController.getTeachers);

// @route   GET api/admin/students
// @desc    Get all students with optional filters
router.get('/students', [auth, adminAuth], adminController.getStudents);

// @route   GET api/admin/student/:id/marks
// @desc    Get marks for a specific student
router.get('/student/:id/marks', [auth, adminAuth], adminController.getStudentMarks);

// @route   GET api/admin/student/:id/attendance
// @desc    Get attendance for a specific student
router.get('/student/:id/attendance', [auth, adminAuth], adminController.getStudentAttendance);

// @route   GET api/admin/payments/teachers
// @desc    Get teacher payments with status filter
router.get('/payments/teachers', [auth, adminAuth], adminController.getTeacherPayments);

// @route   GET api/admin/payments/students
// @desc    Get student payments with status filter
router.get('/payments/students', [auth, adminAuth], adminController.getStudentPayments);

// @route   GET api/admin/dashboard
// @desc    Get dashboard statistics
router.get('/dashboard', [auth, adminAuth], adminController.getDashboard);

// @route   POST api/admin/register/student
// @desc    Register a new student (admin only)
router.post('/register/student', [auth, adminAuth], adminController.registerStudent);

// @route   POST api/admin/register/teacher
// @desc    Register a new teacher (admin only)
router.post('/register/teacher', [auth, adminAuth], adminController.registerTeacher);

// @route   GET api/admin/student/:id/performance
// @desc    Get performance data for a specific student (admin view)
router.get('/student/:id/performance', [auth, adminAuth], adminController.getStudentPerformance);

// @route   GET api/admin/student/:id/attendance-debug
// @desc    Get detailed attendance data with debug info for a student
router.get('/student/:id/attendance-debug', [auth, adminAuth], adminController.getStudentAttendanceDebug);

module.exports = router;