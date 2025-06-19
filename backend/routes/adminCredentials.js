const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminConfig = require('../config/adminConfig');
const bcrypt = require('bcryptjs');

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
router.get('/credentials', [auth, adminAuth], (req, res) => {
  try {
    res.json({ username: adminConfig.username });
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

    // Verify current password
    // For security, we should hash passwords before storing them
    // But since adminConfig.password is stored in plain text currently, we'll compare directly
    if (currentPassword !== adminConfig.password) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update username if provided
    if (newUsername) {
      // In a real implementation, this would update environment variables or a secure database
      // For now, we'll just update the in-memory config
      adminConfig.username = newUsername;
    }

    // Update password if provided
    if (newPassword) {
      // In a real implementation, this would update environment variables or a secure database
      // For now, we'll just update the in-memory config
      adminConfig.password = newPassword;
    }

    // Call the updateCredentials method to log the update attempt
    adminConfig.updateCredentials(newUsername || adminConfig.username, newPassword || '[UNCHANGED]');

    res.json({ message: 'Admin credentials updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;