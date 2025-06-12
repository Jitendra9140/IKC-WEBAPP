const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const uploadRoutes = require('./routes/upload');
const attendanceRoutes = require('./routes/attendance');

dotenv.config();

const app = express();
app.use(express.json());


// ✅ Enable CORS
const allowedOrigins = [
  'https://ikc-webapp.netlify.app',
  'http://localhost:5173'
];

app.use(cors());

app.get('/', (req, res) => {
  res.send('API is working!');
});

// ✅ MongoDB connection
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

// ✅ Static file hosting
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
