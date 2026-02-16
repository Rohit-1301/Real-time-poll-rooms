const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Option text cannot exceed 200 characters']
    },
    voteCount: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  duration: {
    type: Number, // Duration in minutes
    required: false,
    min: 1
  },
  endsAt: {
    type: Date,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validation: Ensure at least 2 options
pollSchema.pre('save', function() {
  if (this.options.length < 2) {
    throw new Error('Poll must have at least 2 options');
  }
});

module.exports = mongoose.model('Poll', pollSchema);
