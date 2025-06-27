const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: String, // 'user' or 'bot'
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// ✅ New Schema with sessionId instead of userId
const chatSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  messages: [messageSchema],
});

module.exports = mongoose.model("Chat", chatSchema);

