const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const uploadRoutes = require('./routes/upload');
const attendanceRoutes = require('./routes/attendance');

dotenv.config();

const app = express();

// ✅ Enable CORS
const allowedOrigins = [
  'https://ikc-webapp.netlify.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// ✅ Handle preflight requests for all routes
app.options('/:path(*)', cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working!');
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ✅ API Routes
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

// ✅ Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

