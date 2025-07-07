const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const adminConfig = require('./config/adminConfig');

dotenv.config();

const app = express();

// ✅ Enable JSON parsing
app.use(express.json());

// ✅ CORS Configuration
const allowedOrigins = [
  'https://ikc-webapp.netlify.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman) or from allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: [
    'Origin',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Requested-With'
  ]
}));



// ✅ Root route
app.get('/', (req, res) => {
  res.send('API is working well!');
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Initialize admin user in database if it doesn't exist
    initializeAdminUser();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Function to ensure admin user exists in the database
async function initializeAdminUser() {
  try {
    // Check if admin user exists in the database
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      // Create admin user in the database using config values
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminConfig.password, salt);
      
      const newAdminUser = new User({
        username: adminConfig.username,
        password: hashedPassword,
        role: 'admin'
      });
      
      await newAdminUser.save();
      console.log('✅ Admin user initialized in database');
    } else {
      console.log('✅ Admin user already exists in database');
    }
  } catch (error) {
    console.error('❌ Error initializing admin user:', error);
  }
}

// ✅ API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/lectures', require('./routes/lectures'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin', require('./routes/adminCredentials'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/attendance',require('./routes/attendance'));

// ✅ Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

