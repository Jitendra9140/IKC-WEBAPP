const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const User = require('../models/User');
const Lecture = require('../models/Lecture');
const Payment = require('../models/Payment');
const TeacherPayment = require('../models/TeacherPayment');

// Create a new teacher
const createTeacher = async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all teachers
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get teacher by ID
const getTeacherById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher user not found' });
    }

    const teacher = await Teacher.findById(user.referenceId);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get teacher by payment ID
const getTeacherByPaymentId = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
  
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get students for a specific teacher based on assigned classes
const getTeacherStudents = async (req, res) => {
  try {
    // Step 1: Find the teacher user
    const teacherUser = await User.findById(req.params.id);
    if (!teacherUser || teacherUser.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher user not found or not valid' });
    }

    // Step 2: Find the teacher document using referenceId
    const teacher = await Teacher.findById(teacherUser.referenceId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Step 3: Create query conditions from assignedClasses
    const classConditions = teacher.assignedClasses.map((assignment) => {
      const condition = { class: assignment.class };
      if (assignment.section) {
        condition.section = assignment.section;
      }
      return condition;
    });

    // Step 4: Find matching students
    const students = await Student.find({ $or: classConditions });

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get teacher payments
const getTeacherPayments = async (req, res) => {
  try {
    // Step 1: Get the user and validate
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Step 2: Get the teacher profile
    const teacher = await Teacher.findById(user.referenceId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Step 3: Fetch existing TeacherPayments (already paid)
    const paidPayments = await TeacherPayment.find({ teacherId: teacher._id });

    // Step 4: Get all lectures for this teacher
    const lectures = await Lecture.find({ teacherId: user._id });

    // Step 5: Group lectures by month and year and calculate dynamic pending payments
    const paymentsMap = {}; // key = "YYYY-MM"

    lectures.forEach(lecture => {
      const date = new Date(lecture.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const assignedClass = teacher.assignedClasses.find(
        c => c.class === lecture.class && c.section === lecture.section
      );
      if (!assignedClass) return;

      const salaryPerHour = assignedClass.salaryPerHour || 0;
      const hours = lecture.duration || 1;

      if (!paymentsMap[key]) {
        paymentsMap[key] = {
          month: key,
          teacherId: teacher._id,
          hours: 0,
          amount: 0,
          paid: false,
          remarks: '',
        };
      }

      paymentsMap[key].hours += hours;
      paymentsMap[key].amount += salaryPerHour * hours;
    });

    // Step 6: Remove already paid months from the map
    const paidMonths = new Set(paidPayments.map(p => p.month));
    const pendingPayments = Object.values(paymentsMap).filter(p => !paidMonths.has(p.month));

    // Step 7: Combine both
    const allPayments = [...paidPayments.map(p => ({
      _id: p._id,
      teacherId: p.teacherId,
      hours: p.hours,
      amount: p.amount,
      remarks: p.remarks,
      month: p.month,
      paid: p.paid,
      paidDate: p.paidDate,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })), ...pendingPayments.map(p => ({
      _id: `${user._id}-${p.month}`, // virtual id
      teacherId: p.teacherId,
      hours: p.hours,
      amount: p.amount,
      remarks: '',
      month: p.month,
      paid: false,
      createdAt: null,
      updatedAt: null,
    }))];

    res.json(allPayments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  getTeacherByPaymentId,
  getTeacherStudents,
  updateTeacher,
  getTeacherPayments
};