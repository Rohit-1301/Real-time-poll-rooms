const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for vote submissions
const voteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 votes per minute
  message: {
    success: false,
    error: 'Too many vote attempts, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for poll creation
const createPollLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 poll creations per hour
  message: {
    success: false,
    error: 'Too many polls created, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  voteLimiter,
  createPollLimiter
};
