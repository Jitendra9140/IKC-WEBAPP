const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const testController = require('../controller/testController');

// @route   POST api/tests
// @desc    Create a new test
router.post('/', auth, testController.createTest);

// @route   GET api/tests
// @desc    Get all tests
router.get('/', auth, testController.getAllTests);

// @route   GET api/tests/teacher/:teacherId
// @desc    Get tests by teacher ID
router.get('/teacher/:teacherId', auth, testController.getTestsByTeacher);

// @route   GET api/tests/class/:class/section/:section
// @desc    Get tests by class and section
router.get('/class/:class/section/:section', auth, testController.getTestsByClassAndSection);

// @route   GET api/tests/:id
// @desc    Get test by ID
router.get('/:id', auth, testController.getTestById);

// @route   PUT api/tests/:id
// @desc    Update test
router.put('/:id', auth, testController.updateTest);

// @route   DELETE api/tests/:id
// @desc    Delete test
router.delete('/:id', auth, testController.deleteTest);

// @route   POST api/tests/:testId/marks
// @desc    Add or update student marks for a test
router.post('/:testId/marks', auth, testController.addOrUpdateTestMarks);

module.exports = router;