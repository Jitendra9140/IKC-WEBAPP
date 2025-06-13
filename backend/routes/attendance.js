const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const attendanceController = require('../controller/attendanceController');

// @route   POST api/attendance
// @desc    Create or update attendance for a lecture
router.post('/', auth, attendanceController.createOrUpdateAttendance);

// @route   GET api/attendance/lecture/:lectureId
// @desc    Get attendance for a specific lecture
router.get('/lecture/:lectureId', auth, attendanceController.getAttendanceByLecture);

// @route   GET api/attendance/student/:studentId
// @desc    Get attendance records for a specific student
router.get('/student/:studentId', auth, attendanceController.getAttendanceByStudent);

module.exports = router;