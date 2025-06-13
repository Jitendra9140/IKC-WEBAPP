const Marks = require('../models/Marks');
const Test = require('../models/Test');
const Student = require('../models/Student');

// Create or update marks for a student
const createOrUpdateMarks = async (req, res) => {
  try {
    const { studentId, testId, marksObtained, totalMarks, subject } = req.body;
    
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
    
    // Check if marks already exist for this student and test
    let marks = await Marks.findOne({ studentId, testId });
    
    if (marks) {
      // Update existing marks
      marks.marksObtained = marksObtained;
      marks.totalMarks = test.totalMarks; // Use test's total marks
      marks.subject = subject;
      await marks.save();
    } else {
      // Create new marks entry
      marks = new Marks({
        studentId,
        testId,
        marksObtained,
        totalMarks: test.totalMarks, // Use test's total marks
        subject
      });
      await marks.save();
    }
    
    res.status(201).json(marks);
  } catch (err) {
    console.error('Error saving marks:', err);
    res.status(400).json({ message: err.message });
  }
};

// Get all marks for a student
const getMarksByStudent = async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId })
      .populate('testId')
      .sort({ 'testId.testDate': -1 });
    
    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all marks for a test
const getMarksByTest = async (req, res) => {
  try {
    const marks = await Marks.find({ testId: req.params.testId })
      .populate('studentId', 'name');
    
    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all marks for a student in a specific subject
const getMarksByStudentAndSubject = async (req, res) => {
  try {
    const marks = await Marks.find({
      studentId: req.params.studentId,
      subject: req.params.subject
    }).populate('testId');
    
    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get performance summary for a student
const getStudentPerformance = async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId })
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