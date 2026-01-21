import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // optional if Node 18+
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// Flag to check if TTS is enabled
let ttsEnabled = true;

// -------------------------
// Root route - test backend
// -------------------------
app.get("/", (req, res) => {
  res.send("Backend is running! Use /api/chat and /api/tts");
});

// -------------------------
// AI Chat Endpoint
// -------------------------
app.post("/api/chat", async (req, res) => {
  const { message, language } = req.body;

  if (!message) return res.json({ reply: "Please enter a message" });

  try {
    // Build prompt
    const prompt =
      language === "Malayalam"
        ? `Translate Malayalam to English and reply naturally: ${message}`
        : `Reply naturally in ${language}: ${message}`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      }),
    });

    const data = await openaiRes.json();

    const reply = data.choices?.[0]?.message?.content || "AI response not available";

    res.json({ reply });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ reply: "AI response not available" });
  }
});

// -------------------------
// Text-to-Speech Endpoint
// -------------------------
app.post("/api/tts", async (req, res) => {
  const { text, language } = req.body;

  if (!text) return res.status(400).send("No text provided for TTS");

  if (!ttsEnabled) {
    return res.status(503).json({ error: "TTS disabled due to quota/API failure" });
  }

  const voices = {
    English: "EXAVITQu4vr4xnSDxMaL",
    Hindi: "pNInz6obpgDQGcFmaJgB",
    Spanish: "TxGEqnHWrfWFTfGW9XjX",
    Malayalam: "EXAVITQu4vr4xnSDxMaL", // fallback
  };

  const voiceId = voices[language] || voices.English;

  try {
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
    });

    // If API key invalid or quota exceeded
    if (!ttsRes.ok) {
      ttsEnabled = false; // disable TTS
      const errorData = await ttsRes.json();
      console.error("ElevenLabs error:", errorData);
      return res.status(503).json({ error: "TTS quota exceeded or API failed" });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error("TTS Error:", err);
    ttsEnabled = false; // disable TTS
    res.status(503).json({ error: "TTS failed, browser TTS can be used as fallback" });
  }
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
