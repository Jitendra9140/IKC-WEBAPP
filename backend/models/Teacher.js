const mongoose = require('mongoose');

const assignedClassSchema = new mongoose.Schema({
  class: { type: String, required: true },             // e.g., "11"
  section: { type: String, required: true }, 
  salaryPerHour: { type: Number, required: true }          // "Commerce" or "Science"
}, { _id: false });

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  subjects: [{ type: String, required: true }],
  assignedClasses: [assignedClassSchema],
  imageUrl: { type: String },
  qualifications: { type: String },
  yearsOfExperience: { type: Number }
}, { timestamps: true });

// Static method to get salary per hour based on section
teacherSchema.statics.getHourlyRate = function (section) {
  if (section === 'Science') return 200;
  if (section === 'Commerce') return 150;
  return 0;
};

module.exports = mongoose.model('Teacher', teacherSchema);
