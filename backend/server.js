const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const uploadRoutes = require('./routes/upload');
const attendanceRoutes = require('./routes/attendance');

dotenv.config();

const app = express();

// 👇 Log all incoming request origins
app.use((req, res, next) => {
  console.log('Incoming request from Origin:', req.headers.origin);
  next();
});

// ✅ Enable CORS
const allowedOrigins = [
  'https://ikc-webapp.netlify.app',
  'http://localhost:5173' // for local testing (optional)
];

app.use(cors({
  origin: "https://ikc-webapp.netlify.app", // no trailing slash
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: [
    "Origin",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Requested-With"
  ]
}));

// ✅ CORS headers for preflight (manual fallback for Render sometimes)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working!');
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/lectures', require('./routes/lectures'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', uploadRoutes);
app.use('/api/attendance', attendanceRoutes);

// Static file hosting
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
