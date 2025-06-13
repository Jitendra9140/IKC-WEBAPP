const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const studentController = require('../controller/studentController');

// @route   POST api/students
// @desc    Create a new student
router.post('/', auth, studentController.createStudent);

// @route   GET api/students
// @desc    Get all students
router.get('/', auth, studentController.getAllStudents);

// @route   GET api/students/:id
// @desc    Get student by ID
router.get('/:id', auth, studentController.getStudentById);

// @route   PUT api/students/:id
// @desc    Update student
router.put('/:id', auth, studentController.updateStudent);

// @route   GET api/students/:id/lectures
// @desc    Get lectures for a student by class and section
router.get('/:id/lectures', auth, studentController.getStudentLectures);

// @route   GET api/students/:id/payments
// @desc    Get payments for a student
router.get('/:id/payments', auth, studentController.getStudentPayments);

// @route   GET api/students/:id/performance
// @desc    Get performance data for a student
router.get('/:id/performance', auth, studentController.getStudentPerformance);

// @route   GET api/students/:userId/marks
// @desc    Get marks for a student
router.get('/:userId/marks', auth, studentController.getStudentMarks);

// @route   GET api/students/direct/:id
// @desc    Get student directly by ID (not user ID)
router.get('/direct/:id', auth, studentController.getStudentDirectById);

module.exports = router;