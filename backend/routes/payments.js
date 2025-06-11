const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');
const TeacherPayment = require('../models/TeacherPayment');
const StudentPayment = require('../models/StudentPayment');
const Teacher = require('../models/Teacher');

// @route   POST api/payments/student
// @desc    Create a new student payment
router.post('/student', auth, async (req, res) => {
  try {
    const payment = new Payment({
      ...req.body,
      type: 'student'
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   POST api/payments/teacher
// @desc    Create a new teacher payment
router.post('/teacher', auth, async (req, res) => {
  try {
    const payment = new Payment({
      ...req.body,
      type: 'teacher'
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.get('/teacher/:teacherId', auth, async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    const payments = await TeacherPayment.find({ teacherId }).sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (err) {
    console.error('Error fetching teacher payments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/payments/teacher/:teacherId
// @desc    Get teacher payments
router.post('/teacher/:teacherId', auth, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { hours, amount, remarks, month } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // ✅ Check for existing payment for the same month
    const existingPayment = await TeacherPayment.findOne({ teacherId, month });
    if (existingPayment) {
      return res.status(409).json({ message: `Payment for ${month} has already been settled.` });
    }

    const newPayment = new TeacherPayment({
      teacherId,
      hours,
      amount,
      remarks,
      month,
      paid: true,
      paidDate: new Date()
    });

    await newPayment.save();

    res.status(201).json({ message: 'Payment recorded successfully', payment: newPayment });

  } catch (err) {
    console.error('Error creating teacher payment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Add these routes to your existing payments.js file

const { getTotalFees, calculateInstallmentAmount } = require('../utils/feeStructure');
const Student = require('../models/Student');

// @route   POST api/payments/student/:studentId/installment
// @desc    Create a new installment payment for a student
router.post('/student/:studentId/installment', auth, async (req, res) => {
  try {
    const { installmentNumber, academicYear, method, remarks, amount } = req.body;
    
    // Find the student
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get total fees based on class and stream
    const totalFees = getTotalFees(student.class, student.section.toLowerCase());
    
    // Default to 3 installments or use the provided value
    const totalInstallments = req.body.totalInstallments || 3;
    
    // Use provided amount or calculate if not provided
    const paymentAmount = amount || calculateInstallmentAmount(totalFees, totalInstallments, installmentNumber);
    
    // Check if this installment already exists
    const existingPayment = await StudentPayment.findOne({
      studentId: student._id,
      installmentNumber,
      academicYear
    });
    
    if (existingPayment) {
      return res.status(400).json({ 
        message: `Installment ${installmentNumber} for ${academicYear} already exists` 
      });
    }
    
    // Create the payment record
    const payment = new StudentPayment({
      studentId: student._id,
      amount: paymentAmount,
      installmentNumber,
      totalInstallments,
      academicYear,
      method: method || 'cash',
      status: 'paid',
      remarks,
      date: new Date()
    });
    
    await payment.save();
    
    // Update the student's due fees and paid fees
    student.dueFees = Math.max(0, student.dueFees - paymentAmount);
    student.paidFees = (student.paidFees || 0) + paymentAmount;
    await student.save();
    
    res.status(201).json(payment);
  } catch (err) {
    console.error('Error creating student payment:', err);
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/payments/student/:studentId
// @desc    Get all payments for a student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const payments = await StudentPayment.find({
      studentId: new mongoose.Types.ObjectId(studentId)
    }).sort({ academicYear: -1, installmentNumber: 1 });

    const totalFees = getTotalFees(student.class, student.section.toLowerCase());

    const paymentsByYear = {};
    payments.forEach(payment => {
      if (!paymentsByYear[payment.academicYear]) {
        paymentsByYear[payment.academicYear] = {
          academicYear: payment.academicYear,
          totalFees,
          paidAmount: 0,
          remainingAmount: totalFees,
          installments: []
        };
      }

      paymentsByYear[payment.academicYear].installments.push(payment);
      if (payment.status === 'paid') {
        paymentsByYear[payment.academicYear].paidAmount += payment.amount;
        paymentsByYear[payment.academicYear].remainingAmount -= payment.amount;
      }
    });

    res.json({
      student: {
        id: student._id,
        name: student.name,
        class: student.class,
        section: student.section,
        totalFees,
        dueFees: student.dueFees,
        paidFees: student.paidFees,
        overallFees: student.overallFees,
        phone: student.phone,
        parentPhone: student.parentPhone,
        address: student.address,
        schoolOrCollegeName: student.schoolOrCollegeName,
        admissionDate: student.admissionDate,
        dob: student.dob,
        imageUrl: student.imageUrl
      },
      paymentsByYear: Object.values(paymentsByYear)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/personalstudent/:studentId', auth, async (req, res) => {
  try {

    console.log('Fetching payments for student', req.params.studentId);

    const userId = req.params.studentId;

    // Step 1: Get the user and validate
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: 'Student user not found' });
    }
    console.log('User found:', user.referenceId);
    // Step 2: Get the student profile using the reference field
    const studentId = user.referenceId;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student data not found' });
    }

    const payments = await StudentPayment.find({
      studentId: new mongoose.Types.ObjectId(studentId)
    }).sort({ academicYear: -1, installmentNumber: 1 });

    const totalFees = getTotalFees(student.class, student.section.toLowerCase());

    const paymentsByYear = {};
    payments.forEach(payment => {
      if (!paymentsByYear[payment.academicYear]) {
        paymentsByYear[payment.academicYear] = {
          academicYear: payment.academicYear,
          totalFees,
          paidAmount: 0,
          remainingAmount: totalFees,
          installments: []
        };
      }

      paymentsByYear[payment.academicYear].installments.push(payment);
      if (payment.status === 'paid') {
        paymentsByYear[payment.academicYear].paidAmount += payment.amount;
        paymentsByYear[payment.academicYear].remainingAmount -= payment.amount;
      }
    });

    res.json({
      student: {
        id: student._id,
        name: student.name,
        class: student.class,
        section: student.section,
        totalFees,
        dueFees: student.dueFees,
        paidFees: student.paidFees,
        overallFees: student.overallFees,
        phone: student.phone,
        parentPhone: student.parentPhone,
        address: student.address,
        schoolOrCollegeName: student.schoolOrCollegeName,
        admissionDate: student.admissionDate,
        dob: student.dob,
        imageUrl: student.imageUrl
      },
      paymentsByYear: Object.values(paymentsByYear)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;