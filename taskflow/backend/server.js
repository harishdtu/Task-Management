require('dotenv').config({ path: './.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();

// ✅ Allowed origins (IMPORTANT: match EXACT frontend URL)
const allowedOrigins = [
  'http://localhost:5173',
  'https://task-management-jade-five.vercel.app',
  'https://task-management-hsz8bmbw1-harishdtus-projects.vercel.app' // 👈 add your current deployed URL
];

// ✅ CORS CONFIG (FIXED)
const corsOptions = {
  origin: function (origin, callback) {
    console.log("🌐 Request Origin:", origin);

    // allow non-browser requests or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`❌ CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true
};

// ✅ Apply CORS properly
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // 🔥 IMPORTANT FIX

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TaskFlow API is running 🚀',
    timestamp: new Date()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('🚀 TaskFlow API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// MongoDB + Server start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Debug env
console.log("🔑 MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");

module.exports = app;