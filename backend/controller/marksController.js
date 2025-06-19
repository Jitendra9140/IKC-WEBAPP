// Marks model removed as requested by user
const Test = require('../models/Test');
const Student = require('../models/Student');

// Create or update marks for a student
const createOrUpdateMarks = async (req, res) => {
  try {
    const { studentId, testId, marksObtained, subject } = req.body;
    
    // Check if student and test exist
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    
    // Validate that marks obtained doesn't exceed test's total marks
    if (marksObtained > test.totalMarks) {
      return res.status(400).json({ 
        message: `Marks obtained (${marksObtained}) cannot exceed test's total marks (${test.totalMarks})` 
      });
    }
    
    // Check if student marks already exist in the test
    const studentMarkIndex = test.studentMarks.findIndex(
      mark => mark.studentId.toString() === studentId.toString()
    );
    
    if (studentMarkIndex !== -1) {
      // Update existing marks
      test.studentMarks[studentMarkIndex].marksObtained = marksObtained;
    } else {
      // Add new student marks
      test.studentMarks.push({
        studentId,
        studentName: student.name,
        marksObtained,
        teacherRemarks: ''
      });
    }
    
    await test.save();
    
    res.status(201).json({
      studentId,
      testId,
      marksObtained,
      totalMarks: test.totalMarks,
      subject: test.subject
    });
  } catch (err) {
    console.error('Error saving marks:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get all marks for a student
const getMarksByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // Find all tests that have marks for this student
    const tests = await Test.find({
      'studentMarks.studentId': studentId
    }).sort({ testDate: -1 });
    
    // Extract the student's marks from each test
    const marks = tests.map(test => {
      const studentMark = test.studentMarks.find(
        mark => mark.studentId.toString() === studentId.toString()
      );
      
      return {
        studentId,
        testId: test._id,
        marksObtained: studentMark.marksObtained,
        totalMarks: test.totalMarks,
        subject: test.subject,
        testDate: test.testDate,
        topic: test.topic,
        teacherRemarks: studentMark.teacherRemarks || ''
      };
    });
    
    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all marks for a test
const getMarksByTest = async (req, res) => {
  try {
    const testId = req.params.testId;
    
    // Find the test
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Format the response to match the previous structure
    const marks = test.studentMarks.map(mark => ({
      studentId: mark.studentId,
      studentName: mark.studentName,
      testId: test._id,
      marksObtained: mark.marksObtained,
      totalMarks: test.totalMarks,
      subject: test.subject,
      teacherRemarks: mark.teacherRemarks || ''
    }));
    
    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all marks for a student in a specific subject
const getMarksByStudentAndSubject = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const subject = req.params.subject;
    
    // Find all tests for this subject that have marks for this student
    const tests = await Test.find({
      subject: subject,
      'studentMarks.studentId': studentId
    }).sort({ testDate: -1 });
    
    // Extract the student's marks from each test
    const marks = tests.map(test => {
      const studentMark = test.studentMarks.find(
        mark => mark.studentId.toString() === studentId.toString()
      );
      
      return {
        studentId,
        testId: test._id,
        marksObtained: studentMark.marksObtained,
        totalMarks: test.totalMarks,
        subject: test.subject,
        testDate: test.testDate,
        topic: test.topic,
        teacherRemarks: studentMark.teacherRemarks || ''
      };
    });
    
    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get performance summary for a student
const getStudentPerformance = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // Find all tests that have marks for this student
    const tests = await Test.find({
      'studentMarks.studentId': studentId
    });
    
    // Extract the student's marks from each test
    const marks = tests.map(test => {
      const studentMark = test.studentMarks.find(
        mark => mark.studentId.toString() === studentId.toString()
      );
      
      return {
        subject: test.subject,
        marksObtained: studentMark.marksObtained,
        totalMarks: test.totalMarks,
        testDate: test.testDate,
        topic: test.topic,
        testId: test._id
      };
    });
    
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
        testId: mark.testId,
        testDate: mark.testDate,
        topic: mark.topic,
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
      subjects: subjectPerformance
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrUpdateMarks,
  getMarksByStudent,
  getMarksByTest,
  getMarksByStudentAndSubject,
  getStudentPerformance
};