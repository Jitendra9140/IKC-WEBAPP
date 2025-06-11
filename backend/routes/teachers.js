const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const User = require('../models/User');
const Lecture = require('../models/Lecture');
const Payment = require('../models/Payment');
const TeacherPayment = require('../models/TeacherPayment');


// @route   POST api/teachers
// @desc    Create a new teacher
router.post('/', auth, async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   GET api/teachers
// @desc    Get all teachers
router.get('/', auth, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/teachers/:id
// @desc    Get teacher by ID
router.get('/:id', auth, async (req, res) => {
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
});
router.get('/payment/:id', auth, async (req, res) => {
  try {
    
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
  

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// @route   GET api/teachers/:id/students
// @desc    Get students for a specific teacher based on assigned classes
router.get('/:id/students', auth, async (req, res) => {
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
});

// @route   PUT api/teachers/:id
// @desc    Update teacher
router.put('/:id', auth, async (req, res) => {
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
});

// router.get('/:id/payments', async (req, res) => {
//   try {
//     // Step 1: Get the user and validate
//     console.log(req.params.id);
//     const user = await User.findById(req.params.id);
//     if (!user || user.role !== 'teacher') {
//       return res.status(404).json({ message: 'Teacher not found' });
//     }

//     // Step 2: Get the teacher profile
//     const teacher = await Teacher.findById(user.referenceId);
//     if (!teacher) {
//       return res.status(404).json({ message: 'Teacher profile not found' });
//     }

//     // Step 3: Get all lectures for this teacher
//     const lectures = await Lecture.find({ teacherId: user._id });

//     // Step 4: Group lectures by month and year and calculate total payment & hours
//     const paymentsMap = {}; // key = "year-month"

//     lectures.forEach(lecture => {
//       const date = new Date(lecture.date);
//       const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
//       // Match assigned class and section
//       const assignedClass = teacher.assignedClasses.find(
//         c => c.class === lecture.class && c.section === lecture.section
//       );
    
//       if (!assignedClass) return; // Skip if no salary data
    
//       const salaryPerHour = assignedClass.salaryPerHour || 0;
//       const hours = lecture.duration || 1;
    
//       if (!paymentsMap[key]) {
//         paymentsMap[key] = {
//           year: date.getFullYear(),
//           month: date.getMonth() + 1,
//           lecturesCount: 0,
//           totalHours: 0,
//           amount: 0,
//         };
//       }
    
//       paymentsMap[key].lecturesCount += 1;
//       paymentsMap[key].totalHours += hours;
//       paymentsMap[key].amount += salaryPerHour * hours;
//     });

//     // Step 5: Convert paymentsMap to array of payments
//     const calculatedPayments = Object.entries(paymentsMap).map(([key, val]) => {
//       const date = new Date(val.year, val.month - 1); // JS month 0-indexed

//       return {
//         _id: `${user._id}-${val.month}-${val.year}`,
//         teacherId: user._id,
//         amount: val.amount,
//         date,
//         status: 'pending',
//         description: `Payment for ${val.lecturesCount} lectures, ${val.totalHours} hours in ${val.month}/${val.year}`,
//         lecturesCount: val.lecturesCount,
//         totalHours: val.totalHours,
//         type: 'teacher',
//       };
//     });

//     // Step 6: Fetch existing payments
//     const existingPayments = await Payment.find({ teacherId: user._id });

//     // Step 7: Merge and avoid duplicates
//     const existingIds = new Set(existingPayments.map(p => p._id.toString()));
//     const newPayments = calculatedPayments.filter(p => !existingIds.has(p._id));
//     const allPayments = [...existingPayments, ...newPayments];

//     // Optional: Save new payments to DB
//     // await Payment.insertMany(newPayments);

//     res.json(allPayments);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });
router.get('/:id/payments', async (req, res) => {
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
});





module.exports = router;