
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* Health check */
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

/* 🤖 AI CHAT */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message) return res.json({ reply: "No message received" });

    const systemPrompt =
      language === "Malayalam"
        ? "Translate Malayalam to English and reply naturally"
        : `Reply naturally in ${language}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "response not available";

    res.json({ reply });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.json({ reply: "response not available" });
  }
});

/* 🔊 ElevenLabs Text-to-Speech */
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language } = req.body;

    const voices = {
      English: "EXAVITQu4vr4xnSDxMaL",
      Hindi: "pNInz6obpgDQGcFmaJgB",
      Spanish: "TxGEqnHWrfWFTfGW9XjX",
      Malayalam: "EXAVITQu4vr4xnSDxMaL"
    };

    const voiceId = voices[language] || voices.English;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2"
        })
      }
    );

    const audioBuffer = await response.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));

  } catch (err) {
    console.error("TTS ERROR:", err);
    res.status(500).json({ error: "TTS failed" });
  }
});

/* 🚀 Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
