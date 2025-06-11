const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  parentPhone: { type: String, required: true },
  address: { type: String, required: true },
  schoolOrCollegeName: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String },
  admissionDate: { type: Date, default: Date.now },
  dob: { type: Date, required: true },
  imageUrl: { type: String },
  overallFees: { type: Number, required: true },
  dueFees: { 
    type: Number, 
    default: function() {
      return this.overallFees;
    }
  },
  paidFees: { type: Number, default: 0 },
  tenthPercentage: { type: Number },
  tenthBoard: { type: String },
  tenthPassingYear: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
