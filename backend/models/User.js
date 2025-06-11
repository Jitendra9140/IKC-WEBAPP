const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'teacher', 'student'] },
  referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'role' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);