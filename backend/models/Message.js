const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index for faster queries
messageSchema.index({ chatId: 1, createdAt: -1 })

module.exports = mongoose.model('Message', messageSchema)
