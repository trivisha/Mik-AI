const express = require("express");
const router = express.Router();
const axios = require("axios");
const Chat = require("../models/Chat");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");


const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

router.post("/ask", async (req, res) => {
  try {
    const { prompt, sessionId } = req.body;

    const latestUserMessage = prompt.split("User:").pop().split("Assistant:")[0].trim();

    const response = await axios.post(
      "https://api.together.xyz/v1/completions",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt,
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices?.[0]?.text?.trim() || "⚠️ No response.";

    // ✅ Find or create chat document using sessionId
    let chat = await Chat.findOne({ sessionId });
    if (!chat) {
      chat = new Chat({ sessionId, messages: [] });
    }

    chat.messages.push({ sender: "user", content: latestUserMessage });
    chat.messages.push({ sender: "bot", content: reply });

    await chat.save();

    res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Chat error:", err.message);
    res.status(500).json({ error: "Chat failed." });
  }
});

// ✅ GET route for loading session history
router.get("/history/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const chat = await Chat.findOne({ sessionId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat.messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// ✅ Optional: list all sessionIds
router.get("/sessions", async (req, res) => {
  try {
    const chats = await Chat.find({}, "sessionId").lean();
    const sessionIds = [...new Set(chats.map((c) => c.sessionId))];
    res.json(sessionIds);
  } catch (err) {
    res.status(500).json({ error: "Failed to load sessions" });
  }
});

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  const { question, sessionId } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  let fileText = "";
  const ext = path.extname(file.originalname).toLowerCase();

  try {
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      fileText = data.text;
    } else if (ext === ".docx" || ext === ".doc") {
      const data = await mammoth.extractRawText({ path: file.path });
      fileText = data.value;
    } else if (ext === ".txt") {
      fileText = fs.readFileSync(file.path, "utf8");
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const prompt = `${fileText}\n\nUser's question: ${question}\nAssistant:`;

    const response = await axios.post(
      "https://api.together.xyz/v1/completions",
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt,
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices?.[0]?.text?.trim() || "⚠️ No response.";

    // Optional: save file message to DB like chat.messages.push({ ... })
    let chat = await Chat.findOne({ sessionId });
    if (!chat) {
      chat = new Chat({ sessionId, messages: [] });
    }

    chat.messages.push({ sender: "user", content: `[File uploaded: ${file.originalname}] ${question}` });
    chat.messages.push({ sender: "bot", content: reply });

    await chat.save();

    res.json({ reply });
  } catch (err) {
    console.error("❌ Upload error:", err.message);
    res.status(500).json({ error: "Failed to process file" });
  } finally {
    fs.unlinkSync(file.path); // delete temp file
  }
});


module.exports = router;
