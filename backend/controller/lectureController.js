const mongoose = require('mongoose');
const Lecture = require('../models/Lecture');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Create a new lecture
const createLecture = async (req, res) => {
  try {
    // Get the teacher's information
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the teacher document to get the name
    const teacher = await Teacher.findById(user.referenceId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    const lecture = new Lecture({
      ...req.body,
      teacherId: req.user.id,
      teacherName: teacher.name
    });
    await lecture.save();
    res.status(201).json(lecture);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all lectures
const getAllLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find()
      .populate('teacherId', 'name');
    res.json(lectures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get lectures by teacher ID
const getLecturesByTeacherId = async (req, res) => {
  try {
    // Validate teacherId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.teacherId)) {
      return res.status(400).json({ message: 'Invalid teacher ID format' });
    }
    
    const lectures = await Lecture.find({ teacherId: req.params.teacherId })
      .populate('teacherId', 'name');
    res.json(lectures);
  } catch (err) {
    console.error('Error fetching lectures:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get lectures by teacher ID for admin
const getLecturesByTeacherIdAdmin = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
  
    // Step 1: Validate teacherId
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: 'Invalid teacher ID format' });
    }

    // Step 2: Find the user corresponding to this teacher
    const user = await User.findOne({ referenceId: teacherId });
    if (!user) {
      return res.status(404).json({ message: 'User not found for the given teacher ID' });
    }

    // Step 3: Fetch lectures using user._id (which is saved as teacherId in Lecture model)
    const lectures = await Lecture.find({ teacherId: user._id })
      .populate('teacherId', 'name');
    
    res.json(lectures);
  } catch (err) {
    console.error('Error fetching lectures:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get lectures by teacher ID for payment
const getLecturesByTeacherIdForPayment = async (req, res) => {
  try {
    // Validate teacherId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.teacherId)) {
      return res.status(400).json({ message: 'Invalid teacher ID format' });
    }
    
    const lectures = await Lecture.find({ teacherId: req.params.teacherId })
      .populate('teacherId', 'name');
    res.json(lectures);
  } catch (err) {
    console.error('Error fetching lectures:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get teacher payments by ID
const getTeacherPaymentsById = async (req, res) => {
  try {
    // Step 1: Get the teacher
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // Step 2: Find the User whose reference is this teacher
    const user = await User.findOne({ referenceId: teacher._id });
    if (!user) return res.status(404).json({ message: 'User not found for this teacher' });

    // Step 3: Get all lectures for this teacher
    const lectures = await Lecture.find({ teacherId: user._id });

    // Step 4: Group lectures by month and year and calculate total payment & hours
    const paymentsMap = {}; // key = "year-month"

    lectures.forEach(lecture => {
      const date = new Date(lecture.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
      // Match assigned class and section
      const assignedClass = teacher.assignedClasses.find(
        c => c.class === lecture.class && c.section === lecture.section
      );
    
      if (!assignedClass) return; // Skip if no salary data
    
      const salaryPerHour = assignedClass.salaryPerHour || 0;
      const hours = lecture.duration || 1;
    
      if (!paymentsMap[key]) {
        paymentsMap[key] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          lecturesCount: 0,
          totalHours: 0,
          amount: 0,
        };
      }
    
      paymentsMap[key].lecturesCount += 1;
      paymentsMap[key].totalHours += hours;
      paymentsMap[key].amount += salaryPerHour * hours;
    });

    // Step 5: Convert paymentsMap to array of payments
    const calculatedPayments = Object.entries(paymentsMap).map(([key, val]) => {
      const date = new Date(val.year, val.month - 1); // JS month 0-indexed

      return {
        _id: `${user._id}-${val.month}-${val.year}`,
        teacherId: user._id,
        amount: val.amount,
        date,
        status: 'pending',
        description: `Payment for ${val.lecturesCount} lectures, ${val.totalHours} hours in ${val.month}/${val.year}`,
        lecturesCount: val.lecturesCount,
        totalHours: val.totalHours,
        type: 'teacher',
      };
    });

    // Step 6: Fetch existing payments
    const existingPayments = await Payment.find({ teacherId: user._id });

    // Step 7: Merge and avoid duplicates
    const existingIds = new Set(existingPayments.map(p => p._id.toString()));
    const newPayments = calculatedPayments.filter(p => !existingIds.has(p._id));
    const allPayments = [...existingPayments, ...newPayments];

    res.json(allPayments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createLecture,
  getAllLectures,
  getLecturesByTeacherId,
  getLecturesByTeacherIdAdmin,
  getLecturesByTeacherIdForPayment,
  getTeacherPaymentsById
};