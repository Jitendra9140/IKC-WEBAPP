const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const teacherController = require('../controller/teacherController');

// @route   POST api/teachers
// @desc    Create a new teacher
router.post('/', auth, teacherController.createTeacher);

// @route   GET api/teachers
// @desc    Get all teachers
router.get('/', auth, teacherController.getAllTeachers);

// @route   GET api/teachers/:id
// @desc    Get teacher by ID
router.get('/:id', auth, teacherController.getTeacherById);

// @route   GET api/teachers/payment/:id
// @desc    Get teacher by payment ID
router.get('/payment/:id', auth, teacherController.getTeacherByPaymentId);

// @route   GET api/teachers/:id/students
// @desc    Get students for a specific teacher based on assigned classes
router.get('/:id/students', auth, teacherController.getTeacherStudents);

// @route   PUT api/teachers/:id
// @desc    Update teacher
router.put('/:id', auth, teacherController.updateTeacher);

// @route   GET api/teachers/:id/payments
// @desc    Get teacher payments
router.get('/:id/payments', teacherController.getTeacherPayments);

module.exports = router;