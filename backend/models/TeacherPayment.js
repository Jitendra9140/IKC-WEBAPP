const mongoose = require('mongoose');
const teacherPaymentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  hours: { type: Number, required: true },
  amount: { type: Number, required: true },
  remarks: { type: String },
  month: { type: String, required: true },
  paid: { type: Boolean, default: false },
  paidDate: { type: Date }
}, {
  timestamps: true
});


module.exports = mongoose.model('TeacherPayment', teacherPaymentSchema);