const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  studentName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['present', 'absent'], 
    required: true 
  }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  lectureId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lecture', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  records: [attendanceRecordSchema],
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create a compound index to ensure one attendance record per lecture
attendanceSchema.index({ lectureId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);