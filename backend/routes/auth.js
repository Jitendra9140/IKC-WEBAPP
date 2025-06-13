const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controller/authController');

// @route   POST api/auth/register
// @desc    Register user
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', authController.login);

// @route   GET api/auth/verify
// @desc    Verify user token and return user data
router.get('/verify', auth, authController.verifyUser);

module.exports = router;