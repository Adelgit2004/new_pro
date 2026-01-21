import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

let ttsEnabled = true; // Auto-disable if ElevenLabs fails

// -------------------------
// AI Chat Endpoint
// -------------------------
app.get("/", (req, res) => {
  res.send("Backend is running! Use /api/chat and /api/tts");
});
app.post("/api/chat", async (req, res) => {
  const { message, language } = req.body;

  if (!message) return res.json({ reply: "Please enter a message" });

  if (!process.env.OPENAI_API_KEY) {
    return res.json({ reply: "OpenAI API key not set. Chat unavailable." });
  }

  try {
    const prompt =
      language === "Malayalam"
        ? `Translate Malayalam to English and reply naturally: ${message}`
        : `Reply naturally in ${language}: ${message}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content || "AI response not available";
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI Chat Error:", err);
    res.status(500).json({ reply: "AI service failed" });
  }
});

// -------------------------
// TTS Endpoint
// -------------------------
app.post("/api/tts", async (req, res) => {
  const { text, language } = req.body;

  if (!text) return res.status(400).send("No text provided");

  if (!ttsEnabled) return res.status(403).json({ error: "Quota exceeded, TTS disabled" });

  const voices = {
    English: "EXAVITQu4vr4xnSDxMaL",
    Hindi: "pNInz6obpgDQGcFmaJgB",
    Spanish: "TxGEqnHWrfWFTfGW9XjX",
    Malayalam: "EXAVITQu4vr4xnSDxMaL", // fallback
  };

  const voiceId = voices[language] || voices.English;

  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      ttsEnabled = false;
      return res.status(403).json({ error: "ElevenLabs API key missing" });
    }

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

    if (!ttsRes.ok) {
      console.error("ElevenLabs TTS Error:", await ttsRes.text());
      ttsEnabled = false;
      return res.status(403).json({ error: "Quota exceeded, TTS disabled" });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error("TTS Error:", err);
    ttsEnabled = false;
    res.status(500).json({ error: "TTS failed" });
  }
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

