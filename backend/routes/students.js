const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const Lecture = require('../models/Lecture');
const Payment = require('../models/Payment');
const Marks = require('../models/Marks');
const User = require('../models/User');
const Test = require('../models/Test');

// @route   POST api/students
// @desc    Create a new student
router.post('/', auth, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   GET api/students
// @desc    Get all students
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/students/:id
// @desc    Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Find the user first
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // If user is found, check if it's a student
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'User is not a student' });
    }
    
    // Find the student using the referenceId from the user
    const student = await Student.findById(user.referenceId);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    
    res.json(student);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT api/students/:id
// @desc    Update student
router.put('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   GET api/students/:id/lectures
// @desc    Get lectures for a student by class and section
router.get('/:id/lectures', auth, async (req, res) => {
  try {
    // 1. Find the user
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Check if the user is a student
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'User is not a student' });
    }

    // 3. Find the student profile
    const student = await Student.findById(user.referenceId);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    // 4. Fetch lectures matching class/section and populate teacher information
    const lectures = await Lecture.find({
      class: student.class,
      $or: [
        { section: student.section },
        { section: { $exists: false } },
        { section: '' }
      ]
    }).populate({
      path: 'teacherId',
      select: '_id',
      populate: {
        path: 'referenceId',
        model: 'Teacher',
        select: 'name'
      }
    });

    // 5. Transform the response to include teacher name directly
    const transformedLectures = lectures.map(lecture => {
      const lectureObj = lecture.toObject();
      
      // Extract teacher name from the populated data
      if (lectureObj.teacherId && lectureObj.teacherId.referenceId) {
        lectureObj.teacherName = lectureObj.teacherId.referenceId.name;
      } else {
        lectureObj.teacherName = 'Unknown';
      }
      
      return lectureObj;
    });

    return res.json(transformedLectures);
  } catch (err) {
    console.error('Error fetching lectures:', err);
    return res.status(500).json({ message: err.message });
  }
});


// @route   GET api/students/:id/payments
// @desc    Get payments for a student
router.get('/:id/payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({
      studentId: req.params.id,
      type: 'student'
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/students/:id/performance
// @desc    Get performance data for a student
router.get('/:id/performance', auth, async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.id })
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
    });
    
    const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    
    res.json({
      overall: {
        totalObtained: totalMarksObtained,
        totalMax: totalMaxMarks,
        percentage: overallPercentage
      },
      subjects: subjectPerformance,
      tests: marks.map(mark => ({
        _id: mark.testId._id,
        subject: mark.subject,
        date: mark.testId.testDate,
        maxMarks: mark.totalMarks,
        obtainedMarks: mark.marksObtained,
        percentage: (mark.marksObtained / mark.totalMarks) * 100
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add this route to your students.js file
// router.get('/:studentId/marks', auth, async (req, res) => {
//   try {
//     // First get marks from the Marks collection
//     console.log('Fetching marks for student:', req.params.studentId);
//     const marks = await Marks.find({ studentId: req.params.studentId })
//       .populate('testId', 'subject topic testDate totalMarks')
//       .sort({ createdAt: -1 });
    
//     // Then get test data that includes student marks with teacher remarks
//     const tests = await Test.find({
//       'studentMarks.studentId': req.params.studentId
//     });
    
//     // Format the response to include test details and teacher remarks
//     const formattedMarks = marks.map(mark => {
//       // Find the corresponding test that might have teacher remarks
//       const test = tests.find(t => t._id.toString() === mark.testId._id.toString());
//       let teacherRemarks = '';
      
//       // If test is found, look for the student's marks entry with remarks
//       if (test && test.studentMarks) {
//         const studentMark = test.studentMarks.find(
//           sm => sm.studentId.toString() === req.params.studentId
//         );
//         if (studentMark) {
//           teacherRemarks = studentMark.teacherRemarks || '';
//         }
//       }
      
//       return {
//         _id: mark._id,
//         subject: mark.subject,
//         marksObtained: mark.marksObtained,
//         totalMarks: mark.totalMarks,
//         test: mark.testId,
//         teacherRemarks: teacherRemarks,
//         createdAt: mark.createdAt
//       };
//     });
    
//     res.json(formattedMarks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


router.get('/:userId/marks', auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Step 1: Get the User and ensure it's a student
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: 'Student user not found' });
    }

    // Step 2: Get the student profile using referenceId
    console.log(user.referenceId);
    const student = await Student.findById(user.referenceId);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }



    const studentId = student._id;
    const studentClass = student.class;
    const studentSection =student.section?.toLowerCase();
    console.log(studentClass,studentSection);

    // Step 3: Get all tests for the student's class and section
    const tests = await Test.find({
      class: studentClass,
      section: studentSection
    });
   console.log(tests);
    // Step 4: Extract the student's marks from each test
    const studentMarksData = tests
      .map(test => {
        const markEntry = test.studentMarks.find(sm => sm.studentId.toString() === studentId.toString());
        if (markEntry) {
          return {
            subject: test.subject,
            topic: test.topic,
            testDate: test.testDate,
            totalMarks: test.totalMarks,
            marksObtained: markEntry.marksObtained,
            teacherRemarks: markEntry.teacherRemarks || '',
            testId: test._id,
            createdAt: test.createdAt
          };
        }
        return null;
      })
      .filter(Boolean); // Remove nulls (i.e., tests without marks for this student)

    res.json(studentMarksData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
// @route   GET api/students/direct/:id
// @desc    Get student directly by ID (not user ID)
router.get('/direct/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;