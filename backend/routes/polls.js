const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const { createPollLimiter } = require('../middleware/rateLimiter');
const { optionalAuth } = require('../middleware/auth');

/**
 * @route   POST /api/polls
 * @desc    Create a new poll
 * @access  Public (optionally authenticated)
 */
router.post('/', createPollLimiter, optionalAuth, async (req, res, next) => {
  try {
    const { question, options, duration } = req.body;

    // Validation
    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 options are required'
      });
    }

    // Validate and sanitize options
    const validOptions = options
      .filter(opt => opt && opt.trim())
      .map(opt => ({
        text: opt.trim(),
        voteCount: 0
      }));

    if (validOptions.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 valid options are required'
      });
    }

    // Calculate endsAt if duration is provided
    let endsAt = null;
    if (duration && duration > 0) {
      endsAt = new Date(Date.now() + duration * 60 * 1000); // Convert minutes to milliseconds
    }

    // Create poll
    const poll = new Poll({
      question: question.trim(),
      options: validOptions,
      totalVotes: 0,
      createdBy: req.userId || null, // Link to user if authenticated
      duration: duration || null,
      endsAt: endsAt
    });

    await poll.save();

    res.status(201).json({
      success: true,
      data: poll
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/polls/:id
 * @desc    Get a poll by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found'
      });
    }

    // Check if poll is still active
    const isActive = poll.endsAt ? new Date() < new Date(poll.endsAt) : true;

    // If poll is active and has a time limit, hide vote counts
    let pollData = poll.toObject();
    
    if (isActive && poll.endsAt) {
      // Hide vote counts for active time-limited polls
      pollData.options = pollData.options.map(opt => ({
        text: opt.text,
        voteCount: 0 // Hidden
      }));
      pollData.totalVotes = 0; // Hidden
    }

    // Add isActive field
    pollData.isActive = isActive;

    res.json({
      success: true,
      data: pollData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
