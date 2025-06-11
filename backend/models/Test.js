const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  class: { type: String, enum: ['11', '12'], required: true },
  section: { type: String, enum: ['science', 'commerce'], required: true },
  optionalSubject: { type: String, enum: ['maths', 'sp', 'biology'], default: null },
  testDate: { type: Date, required: true },
  topic: { type: String, required: true },
  totalMarks: { type: Number, required: true, default: 40 },
  testDuration: { type: Number, required: true, default: 1 }, // Duration in hours
  studentMarks: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    marksObtained: { type: Number, required: true },
    teacherRemarks: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', testSchema);