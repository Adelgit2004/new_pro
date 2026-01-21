import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

/* ---------------- AI CHAT ---------------- */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.json({ reply: "Please enter a message." });
    }

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
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    if (!data.choices) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ reply: "AI service failed" });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "AI service failed" });
  }
});

/* ---------------- TEXT TO SPEECH ---------------- */
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).send("No text provided");
    }

    const voices = {
      English: "EXAVITQu4vr4xnSDxMaL",
      Hindi: "pNInz6obpgDQGcFmaJgB",
      Spanish: "TxGEqnHWrfWFTfGW9XjX",
      Malayalam: "EXAVITQu4vr4xnSDxMaL",
    };

    const voiceId = voices[language] || voices.English;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs error:", errText);
      return res.status(500).send("TTS failed");
    }

    const audio = Buffer.from(await response.arrayBuffer());
    res.set("Content-Type", "audio/mpeg");
    res.send(audio);
  } catch (err) {
    console.error("TTS crash:", err);
    res.status(500).send("TTS failed");
  }
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
