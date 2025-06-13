const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const marksController = require('../controller/marksController');

// @route   POST api/marks
// @desc    Create or update marks for a student
router.post('/', auth, marksController.createOrUpdateMarks);

// @route   GET api/marks/student/:studentId
// @desc    Get all marks for a student
router.get('/student/:studentId', auth, marksController.getMarksByStudent);

// @route   GET api/marks/test/:testId
// @desc    Get all marks for a test
router.get('/test/:testId', auth, marksController.getMarksByTest);

// @route   GET api/marks/student/:studentId/subject/:subject
// @desc    Get all marks for a student in a specific subject
router.get('/student/:studentId/subject/:subject', auth, marksController.getMarksByStudentAndSubject);

// @route   GET api/marks/performance/student/:studentId
// @desc    Get performance summary for a student
router.get('/performance/student/:studentId', auth, marksController.getStudentPerformance);

module.exports = router;