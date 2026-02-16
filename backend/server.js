require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const pollRoutes = require('./routes/polls');
const voteRoutes = require('./routes/votes');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// CORS origin normalization
const rawFrontEndUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const FRONTEND_URL = rawFrontEndUrl.replace(/\/$/, '');

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/poll-rooms';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Socket.io real-time events
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join poll room
  socket.on('join-poll', (pollId) => {
    socket.join(pollId);
    console.log(`👤 User ${socket.id} joined poll room: ${pollId}`);
  });

  // Leave poll room
  socket.on('leave-poll', (pollId) => {
    socket.leave(pollId);
    console.log(`👤 User ${socket.id} left poll room: ${pollId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Emit vote update to all clients in poll room
// This function will be called from the vote route
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
