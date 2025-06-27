const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

// Save a new chat message
router.post("/save", async (req, res) => {
  const { userId, sender, content } = req.body;

  try {
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    chat.messages.push({ sender, content });
    await chat.save();

    res.status(200).json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get previous chats
router.get("/:userId", async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.params.userId });
    res.status(200).json(chat || { messages: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
