const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'New Chat'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for faster queries
chatSchema.index({ members: 1 })

module.exports = mongoose.model('Chat', chatSchema)
