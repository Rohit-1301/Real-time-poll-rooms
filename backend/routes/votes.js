const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const { getHashedIp } = require('../utils/ipHash');
const { voteLimiter } = require('../middleware/rateLimiter');
const { optionalAuth } = require('../middleware/auth');

/**
 * @route   POST /api/votes
 * @desc    Submit a vote with anti-abuse checks
 * @access  Public (optionally authenticated)
 */
router.post('/', voteLimiter, optionalAuth, async (req, res, next) => {
  try {
    const { pollId, optionIndex, voterToken } = req.body;

    // Validation
    if (!pollId || optionIndex === undefined || !voterToken) {
      return res.status(400).json({
        success: false,
        error: 'Poll ID, option index, and voter token are required'
      });
    }

    // Find poll
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found'
      });
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid option index'
      });
    }

    // Check if poll is still active (if it has an end time)
    if (poll.endsAt && new Date() > new Date(poll.endsAt)) {
      return res.status(400).json({
        success: false,
        error: 'This poll has ended. Voting is no longer allowed.'
      });
    }

    // HYBRID ANTI-ABUSE LOGIC
    // If user is authenticated, check by userId
    // If user is anonymous, check by IP + browser token
    
    let voterIpHash = null; // Initialize voterIpHash

    if (req.userId) {
      // Authenticated user - check if they already voted using their userId
      const existingUserVote = await Vote.findOne({
        pollId,
        userId: req.userId
      });

      if (existingUserVote) {
        return res.status(400).json({
          success: false,
          error: 'You have already voted in this poll'
        });
      }
      // Still get IP hash for authenticated users (for analytics)
      voterIpHash = getHashedIp(req);
    } else {
      // Anonymous user - check IP and browser token
      voterIpHash = getHashedIp(req);
      
      // Check 1: Browser token
      const existingTokenVote = await Vote.findOne({
        pollId,
        voterToken
      });

      if (existingTokenVote) {
        return res.status(400).json({
          success: false,
          error: 'You have already voted in this poll'
        });
      }

      // Check 2: IP address
      const existingIpVote = await Vote.findOne({
        pollId,
        voterIpHash
      });

      if (existingIpVote) {
        return res.status(400).json({
          success: false,
          error: 'You have already voted in this poll'
        });
      }
    }

    // Create vote record
    const vote = new Vote({
      pollId,
      optionIndex,
      voterToken,
      voterIpHash,
      userId: req.userId || null // Add userId if authenticated
    });
    await vote.save();

    // Update poll vote counts
    poll.options[optionIndex].voteCount += 1;
    poll.totalVotes += 1;
    await poll.save();

    // Emit real-time update to all clients in this poll room
    const io = req.app.get('io');
    if (io) {
      io.to(pollId.toString()).emit('vote-update', poll);
    }

    // Check if poll is still active
    const isActive = poll.endsAt ? new Date() < new Date(poll.endsAt) : true;

    // Prepare response data
    let responseData = poll.toObject();
    
    // If poll is active and has a time limit, hide vote counts in response
    if (isActive && poll.endsAt) {
      responseData.options = responseData.options.map(opt => ({
        text: opt.text,
        voteCount: 0 // Hidden
      }));
      responseData.totalVotes = 0; // Hidden
    }

    // Add isActive field
    responseData.isActive = isActive;

    res.status(201).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
