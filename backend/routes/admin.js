const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Lecture = require('../models/Lecture');
const Test = require('../models/Test');
const Marks = require('../models/Marks');
const Payment = require('../models/Payment');
const TeacherPayment = require('../models/TeacherPayment');
const StudentPayment = require('../models/StudentPayment');
const Attendance = require('../models/Attendance'); // Add this line

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admin only.' });
};

// @route   GET api/admin/teachers
// @desc    Get all teachers with optional filters
router.get('/teachers', [auth, adminAuth], async (req, res) => {
  try {
    const { subject, teachesClass, section } = req.query;
    let query = {};
    
    if (subject) {
      query.subjects = subject;
    }
    
    if (teachesClass) {
      // Find teachers with assigned classes matching the class level
      query['assignedClasses.class'] = teachesClass;
    }
    
    if (section) {
      // Find teachers with assigned classes matching the section
      query['assignedClasses.section'] = section;
    }
    
    const teachers = await Teacher.find(query);
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/admin/students
// @desc    Get all students with optional filters
router.get('/students', [auth, adminAuth], async (req, res) => {
  try {
    const { classLevel, section } = req.query;
    let query = {};
    
    if (classLevel) {
      query.class = classLevel;
    }
    
    if (section) {
      query.section = section;
    }
    
    const students = await Student.find(query);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/admin/student/:id/marks
// @desc    Get marks for a specific student
router.get('/student/:id/marks', [auth, adminAuth], async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.id })
      .populate('testId');
    
    if (!marks.length) {
      return res.status(404).json({ message: 'No marks found for this student' });
    }
    
    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/admin/student/:id/attendance
// @desc    Get attendance for a specific student
router.get('/student/:id/attendance', [auth, adminAuth], async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find all lectures for this student's class and section
    const allLectures = await Lecture.find({
      class: student.class,
      section: student.section
    }).populate('teacherId', 'name');
    
    // Find lectures where this student is in attendees
    const attendedLectures = await Lecture.find({
      attendees: req.params.id
    }).populate('teacherId', 'name');
    
    const attendance = {
      total: allLectures.length,
      attended: attendedLectures.length,
      percentage: allLectures.length > 0 ? 
        (attendedLectures.length / allLectures.length) * 100 : 0,
      lectures: attendedLectures
    };
    
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/admin/payments/teachers
// @desc    Get teacher payments with status filter
router.get('/payments/teachers', [auth, adminAuth], async (req, res) => {
  try {
    const { status } = req.query;
    let query = { type: 'teacher' };
    
    if (status) {
      query.status = status;
    }
    const payments = await Payment.find(query)
      .populate('teacherId', 'name');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/admin/payments/students
// @desc    Get student payments with status filter
router.get('/payments/students', [auth, adminAuth], async (req, res) => {
  try {
    const { status } = req.query;
    let query = { type: 'student' };
    
    if (status) {
      query.status = status;
    }
    
    const payments = await Payment.find(query)
      .populate('studentId', 'name');
    
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/admin/dashboard
// @desc    Get dashboard statistics
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
  try {
    // Count total students
    const totalStudents = await Student.countDocuments();
    
    // Count total teachers
    const totalTeachers = await Teacher.countDocuments();
    
    // Count total lectures
    const totalLectures = await Lecture.countDocuments();
    
    // Count upcoming lectures (today and future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingLectures = await Lecture.countDocuments({
      scheduledDate: { $gte: today }
    });
    
    // Calculate total student fees due
    const students = await Student.find();
    const totalDueFees = students.reduce((total, student) => total + (student.dueFees || 0), 0);
    
    // Calculate total teacher payments pending
    const pendingTeacherPayments = await Payment.find({
      type: 'teacher',
      status: 'pending'
    });
    const totalPendingPayments = pendingTeacherPayments.reduce(
      (total, payment) => total + payment.amount, 0
    );
    
    // Get class distribution
    const class11Students = await Student.countDocuments({ class: '11' });
    const class12Students = await Student.countDocuments({ class: '12' });
    
    // Get section distribution
    const scienceStudents = await Student.countDocuments({ section: 'science' });
    const commerceStudents = await Student.countDocuments({ section: 'commerce' });
    
    res.json({
      counts: {
        students: totalStudents,
        teachers: totalTeachers,
        lectures: totalLectures,
        upcomingLectures
      },
      finances: {
        totalDueFees,
        totalPendingPayments
      },
      distribution: {
        classes: {
          '11': class11Students,
          '12': class12Students
        },
        sections: {
          science: scienceStudents,
          commerce: commerceStudents
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST api/admin/register/student
// @desc    Register a new student (admin only)
router.post('/register/student', [auth, adminAuth], async (req, res) => {
  try {
    const { username, password, role, ...profileData } = req.body;

    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create student profile
    const studentProfile = new Student(profileData);
    const savedProfile = await studentProfile.save();

    // Create user with reference to profile
    user = new User({
      username,
      password,
      role: 'student',
      referenceId: savedProfile._id
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ message: 'Student registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/admin/register/teacher
// @desc    Register a new teacher (admin only)
router.post('/register/teacher', [auth, adminAuth], async (req, res) => {
  try {
    const { username, password, role, ...profileData } = req.body;

    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create teacher profile
    const teacherProfile = new Teacher(profileData);
    const savedProfile = await teacherProfile.save();

    // Create user with reference to profile
    user = new User({
      username,
      password,
      role: 'teacher',
      referenceId: savedProfile._id
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ message: 'Teacher registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/admin/student/:id/performance
// @desc    Get performance data for a specific student (admin view)
router.get('/student/:id/performance', [auth, adminAuth], async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get all marks for this student
    const marks = await Marks.find({ studentId })
      .populate('testId');
    
    // Group marks by subject
    const subjectPerformance = {};
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    
    marks.forEach(mark => {
      if (!subjectPerformance[mark.subject]) {
        subjectPerformance[mark.subject] = {
          totalObtained: 0,
          totalMax: 0,
          tests: []
        };
      }
      
      subjectPerformance[mark.subject].totalObtained += mark.marksObtained;
      subjectPerformance[mark.subject].totalMax += mark.totalMarks;
      subjectPerformance[mark.subject].tests.push({
        testId: mark.testId._id,
        testDate: mark.testId.testDate,
        topic: mark.testId.topic,
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks,
        percentage: (mark.marksObtained / mark.totalMarks) * 100
      });
      
      totalMarksObtained += mark.marksObtained;
      totalMaxMarks += mark.totalMarks;
    });
    
    // Calculate percentages for each subject
    Object.keys(subjectPerformance).forEach(subject => {
      const subjectData = subjectPerformance[subject];
      subjectData.percentage = (subjectData.totalObtained / subjectData.totalMax) * 100;
      // Sort tests by date (newest first)
      subjectData.tests.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));
    });
    
    const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    
    // Get recent tests (last 5)
    const recentTests = marks
      .sort((a, b) => new Date(b.testId.testDate) - new Date(a.testId.testDate))
      .slice(0, 5)
      .map(mark => ({
        _id: mark.testId._id,
        subject: mark.subject,
        topic: mark.testId.topic,
        date: mark.testId.testDate,
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks,
        percentage: (mark.marksObtained / mark.totalMarks) * 100
      }));
    
    res.json({
      studentInfo: {
        name: student.name,
        class: student.class,
        section: student.section
      },
      overall: {
        totalObtained: totalMarksObtained,
        totalMax: totalMaxMarks,
        percentage: overallPercentage,
        testsCount: marks.length
      },
      subjects: subjectPerformance,
      recentTests
    });
  } catch (err) {
    console.error('Error fetching performance data:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/admin/student/:id/attendance
// @desc    Get detailed attendance data for a specific student (admin view)
// @route   GET api/admin/student/:id/attendance-debug
// @desc    Get detailed attendance data with debug info for a student
router.get('/student/:id/attendance-debug', [auth, adminAuth], async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        message: 'Student not found',
        debug: { studentId }
      });
    }
    
    // Find all attendance records where this student is included
    const attendanceRecords = await Attendance.find({
      'records.studentId': studentId
    }).populate({
      path: 'lectureId',
      select: 'subject topic date startTime endTime teacherId',
      populate: {
        path: 'teacherId',
        select: 'name'
      }
    }).sort({ date: -1 });
    
    // Extract attendance status for this student from each record
    const attendanceDetails = attendanceRecords.map(record => {
      const studentRecord = record.records.find(
        r => r.studentId.toString() === studentId
      );
      
      return {
        date: record.date,
        status: studentRecord ? studentRecord.status : 'absent',
        lecture: {
          _id: record.lectureId._id,
          subject: record.lectureId.subject,
          topic: record.lectureId.topic,
          startTime: record.lectureId.startTime,
          endTime: record.lectureId.endTime,
          teacher: record.lectureId.teacherId ? record.lectureId.teacherId.name : 'Unknown'
        }
      };
    });
    
    // Calculate overall attendance statistics
    const totalClasses = attendanceDetails.length;
    const presentCount = attendanceDetails.filter(record => record.status === 'present').length;
    const absentCount = totalClasses - presentCount;
    const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;
    
    // Group attendance by subject
    const subjectAttendance = {};
    attendanceDetails.forEach(record => {
      const subject = record.lecture.subject;
      if (!subjectAttendance[subject]) {
        subjectAttendance[subject] = {
          total: 0,
          present: 0,
          absent: 0,
          percentage: 0
        };
      }
      
      subjectAttendance[subject].total += 1;
      if (record.status === 'present') {
        subjectAttendance[subject].present += 1;
      } else {
        subjectAttendance[subject].absent += 1;
      }
    });
    
    // Calculate percentage for each subject
    Object.keys(subjectAttendance).forEach(subject => {
      const { total, present } = subjectAttendance[subject];
      subjectAttendance[subject].percentage = total > 0 ? (present / total) * 100 : 0;
    });
    
    // Prepare debug information
    const debugInfo = {
      recordsFound: attendanceRecords.length,
      studentInfo: student,
      rawRecords: attendanceRecords.slice(0, 2), // Include first 2 raw records for debugging
      queryParams: req.params,
      timestamp: new Date().toISOString(),
      responseFormat: 'v1.1'
    };
    
    // Send the response with debug information
    res.json({
      student: {
        _id: student._id,
        name: student.name,
        class: student.classLevel,
        section: student.section
      },
      overall: {
        totalClasses,
        present: presentCount,
        absent: absentCount,
        percentage: attendancePercentage
      },
      subjectWise: subjectAttendance,
      records: attendanceDetails,
      debug: debugInfo,
      formatVersion: '1.1',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error fetching student attendance debug:', err.message);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;