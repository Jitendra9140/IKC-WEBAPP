const mongoose = require('mongoose');

const studentPaymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['cash', 'online', 'check'], default: 'cash' },
  receiptUrl: { type: String },
  installmentNumber: { type: Number, required: true }, // 1st, 2nd, or 3rd installment
  totalInstallments: { type: Number, required: true, default: 3 }, // Total number of installments
  academicYear: { type: String, required: true }, // e.g., "2023-2024"
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  remarks: { type: String }
}, {
  timestamps: true
});


// Create a compound index to ensure unique installments per student per academic year
studentPaymentSchema.index(
  { studentId: 1, installmentNumber: 1, academicYear: 1 }, 
  { unique: true }
);

module.exports = mongoose.model('StudentPayment', studentPaymentSchema);