const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const adminConfig = require('../config/adminConfig');

// Register user
const register = async (req, res) => {
  try {
    const { username, password, role, ...profileData } = req.body;

    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create the appropriate profile based on role
    let profileModel;
    if (role === 'student') {
      profileModel = new Student(profileData);
    } else if (role === 'teacher') {
      profileModel = new Teacher(profileData);
    }

    // Only save profile if it's student or teacher
    let savedProfile;
    if (profileModel) {
      savedProfile = await profileModel.save();
    }

    // Create user with reference to profile
    user = new User({
      username,
      password,
      role,
      referenceId: savedProfile ? savedProfile._id : null
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Authenticate user & get token
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the credentials match admin credentials
    if (username === adminConfig.username && password === adminConfig.password) {
      // Create admin payload
      const adminPayload = {
        user: {
          id: 'admin',
          role: 'admin'
        }
      };

      // Sign token for admin
      return jwt.sign(
        adminPayload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            role: 'admin',
            userId: 'admin'
          });
        }
      );
    }

    // If not admin, proceed with regular user authentication
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          role: user.role,
          userId: user.id
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Verify user token and return user data
const verifyUser = async (req, res) => {
  try {
    // Special handling for admin user
    if (req.user.id === 'admin') {
      return res.json({
        _id: 'admin',
        username: adminConfig.username,
        role: 'admin'
      });
    }

    // Regular user verification
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  register,
  login,
  verifyUser
};