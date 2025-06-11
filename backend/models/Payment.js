const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: function() { return this.type === 'student'; }
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: function() { return this.type === 'teacher'; }
  },
  type: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  description: {
    type: String
  },
  paymentMethod: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);