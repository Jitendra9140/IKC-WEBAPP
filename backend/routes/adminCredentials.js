const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminConfig = require('../config/adminConfig');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admin only.' });
};

// @route   GET api/admin/credentials
// @desc    Get admin username (not password for security)
// @access  Admin only
router.get('/credentials', [auth, adminAuth], async (req, res) => {
  try {
    // Get admin user from database
    const adminUser = await User.findOne({ role: 'admin' }).select('username');
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    
    res.json({ username: adminUser.username });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/update-credentials
// @desc    Update admin credentials
// @access  Admin only
router.post('/update-credentials', [auth, adminAuth], async (req, res) => {
  try {
    const { currentPassword, newPassword, newUsername } = req.body;

    // Find admin user in database
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Verify current password using bcrypt
    const isMatch = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update username if provided
    if (newUsername) {
      adminUser.username = newUsername;
      
      // Also update in adminConfig for backward compatibility
      adminConfig.username = newUsername;
    }

    // Update password if provided
    if (newPassword) {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      adminUser.password = await bcrypt.hash(newPassword, salt);
      
      // Also update in adminConfig for backward compatibility
      adminConfig.password = newPassword;
    }

    // Save changes to database
    await adminUser.save();

    // Call the updateCredentials method to log the update attempt (for backward compatibility)
    adminConfig.updateCredentials(newUsername || adminUser.username, newPassword ? '[UPDATED]' : '[UNCHANGED]');

    res.json({ message: 'Admin credentials updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;