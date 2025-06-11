const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  subject: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Marks', marksSchema);