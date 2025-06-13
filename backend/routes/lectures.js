const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const lectureController = require('../controller/lectureController');

// @route   POST api/lectures
// @desc    Create a new lecture
router.post('/', auth, lectureController.createLecture);

// @route   GET api/lectures
// @desc    Get all lectures
router.get('/', auth, lectureController.getAllLectures);

// @route   GET api/lectures/teacher/:teacherId
// @desc    Get lectures by teacher ID
router.get('/teacher/:teacherId', auth, lectureController.getLecturesByTeacherId);

// @route   GET api/lectures/teacher/:teacherId/admin
// @desc    Get lectures by teacher ID for admin
router.get('/teacher/:teacherId/admin', auth, lectureController.getLecturesByTeacherIdAdmin);

// @route   GET api/lectures/teacher/payment/:teacherId
// @desc    Get lectures by teacher ID for payment
router.get('/teacher/payment/:teacherId', auth, lectureController.getLecturesByTeacherIdForPayment);

// @route   GET api/lectures/teacher/:id/payments
// @desc    Get teacher payments by ID
router.get('/teacher/:id/payments', lectureController.getTeacherPaymentsById);

module.exports = router;