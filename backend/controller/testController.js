const Test = require('../models/Test');
const Marks = require('../models/Marks');
const User = require('../models/User');

// Create a new test
const createTest = async (req, res) => {
  try {
    const test = new Test({
      ...req.body,
      teacherId: req.body.teacherId || req.user.id
    });
    await test.save();
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all tests
const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find()
      .populate('teacherId', 'name');
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get tests by teacher ID
const getTestsByTeacher = async (req, res) => {
  try {
    const tests = await Test.find({ teacherId: req.params.teacherId })
      .populate('teacherId', 'name');
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get tests by class and section
const getTestsByClassAndSection = async (req, res) => {
  try {
    const tests = await Test.find({
      class: req.params.class,
      section: req.params.section.toLowerCase()
    }).populate('teacherId', 'name');
    console.log(tests);
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get test by ID
const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('teacherId', 'name');
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update test
const updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete test
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    
    await test.remove();
    res.json({ message: 'Test removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add or update student marks for a test
const addOrUpdateTestMarks = async (req, res) => {
  try {
    const { testId } = req.params;
    const { studentMarks } = req.body;

    console.log('Received request:', req.body);
    console.log('Received testId:', testId);
    console.log('Received studentMarks:', studentMarks);

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    for (const mark of studentMarks) {
      if (mark.marksObtained > test.totalMarks) {
        return res.status(400).json({
          message: `Marks obtained (${mark.marksObtained}) cannot exceed test's total marks (${test.totalMarks})`
        });
      }
    }

    // Update only studentMarks without triggering validation on topic etc.
    await Test.findByIdAndUpdate(
      testId,
      { $set: { studentMarks } },
      { new: true }
    );

    res.status(200).json({ message: 'Marks updated successfully' });
  } catch (err) {
    console.error('Error updating test marks:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createTest,
  getAllTests,
  getTestsByTeacher,
  getTestsByClassAndSection,
  getTestById,
  updateTest,
  deleteTest,
  addOrUpdateTestMarks
};