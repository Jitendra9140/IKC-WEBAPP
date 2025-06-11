const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Lecture = require('../models/Lecture');
const Student = require('../models/Student');

// @route   POST api/attendance
// @desc    Create or update attendance for a lecture
router.post('/', auth, async (req, res) => {
  try {
    const { lectureId, records } = req.body;
    
    if (!lectureId || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Invalid attendance data' });
    }
    
    // Find the lecture to get the date
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    
    // Check if attendance already exists for this lecture
    let attendance = await Attendance.findOne({ lectureId });
    
    if (attendance) {
      // Update existing attendance
      attendance.records = records;
      attendance.date = lecture.date;
      await attendance.save();
    } else {
      // Create new attendance
      attendance = new Attendance({
        lectureId,
        date: lecture.date,
        records,
        markedBy: req.user.id
      });
      await attendance.save();
    }
    
    res.status(200).json(attendance);
  } catch (err) {
    console.error('Error saving attendance:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/attendance/lecture/:lectureId
// @desc    Get attendance for a specific lecture
router.get('/lecture/:lectureId', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ lectureId: req.params.lectureId });
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found for this lecture' });
    }
    
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/attendance/student/:studentId
// @desc    Get attendance records for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({
      'records.studentId': req.params.studentId
    }).populate('lectureId');
    
    res.json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;