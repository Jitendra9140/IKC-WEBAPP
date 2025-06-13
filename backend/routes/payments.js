const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controller/paymentController');

// @route   POST api/payments/student
// @desc    Create a new student payment
router.post('/student', auth, paymentController.createStudentPayment);

// @route   POST api/payments/teacher
// @desc    Create a new teacher payment
router.post('/teacher', auth, paymentController.createTeacherPayment);

// @route   GET api/payments/teacher/:teacherId
// @desc    Get teacher payments
router.get('/teacher/:teacherId', auth, paymentController.getTeacherPayments);

// @route   POST api/payments/teacher/:teacherId
// @desc    Create teacher payment
router.post('/teacher/:teacherId', auth, paymentController.createTeacherPaymentById);

// @route   POST api/payments/student/:studentId/installment
// @desc    Create a new installment payment for a student
router.post('/student/:studentId/installment', auth, paymentController.createStudentInstallment);

// @route   GET api/payments/student/:studentId
// @desc    Get all payments for a student
router.get('/student/:studentId', auth, paymentController.getStudentPayments);

// @route   GET api/payments/personalstudent/:studentId
// @desc    Get payments for a student by user ID
router.get('/personalstudent/:studentId', auth, paymentController.getPersonalStudentPayments);

module.exports = router;