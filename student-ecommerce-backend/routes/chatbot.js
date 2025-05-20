const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
require("dotenv").config();

// ✅ Initialize OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Load API key from .env
  basePath: "https://api.openai.com/v1", // Optional, if needed for custom base path
});

// ✅ POST /api/chat - Handle chatbot messages
router.post("/", async (req, res) => {
  const { message, history } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use gpt-4 if you have access
      messages: [
        ...(history || []),
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("❌ Chatbot Error:", error); // <-- log full error, not just .message
    res.status(500).json({ error: "Something went wrong with the chatbot." });
  }
  
});

module.exports = router;
