const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
    index: true
  },
  optionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  voterToken: {
    type: String,
    required: true,
    index: true
  },
  voterIpHash: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for efficient duplicate vote checking
voteSchema.index({ pollId: 1, voterToken: 1 });
voteSchema.index({ pollId: 1, voterIpHash: 1 });
voteSchema.index({ pollId: 1, userId: 1 });

module.exports = mongoose.model('Vote', voteSchema);
