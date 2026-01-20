
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------------------
   HEALTH CHECK
---------------------------- */
app.get("/", (_, res) => {
  res.json({ status: "Backend running ✅" });
});

/* ---------------------------
   CHAT ENDPOINT (FIXED)
---------------------------- */
app.post("/api/chat", async (req, res) => {
  const { message, language = "English" } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Message is required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ reply: "OpenAI API key missing" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Reply naturally in ${language}: ${message}`,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return res.status(500).json({ reply: "AI service failed" });
    }

    const data = await response.json();
    const reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "No response";

    res.json({ reply });
  } catch (err) {
    console.error("Chat crash:", err);
    res.status(500).json({ reply: "Server error" });
  }
});

/* ---------------------------
   TTS ENDPOINT (HARDENED)
---------------------------- */
app.post("/api/tts", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).send("Text required");

  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(500).send("ElevenLabs API key missing");
  }

  try {
    const ttsRes = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
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

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      console.error("ElevenLabs error:", err);
      return res.status(500).send("TTS failed");
    }

    const buffer = Buffer.from(await ttsRes.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error("TTS crash:", err);
    res.status(500).send("TTS server error");
  }
});

/* ---------------------------
   START SERVER
---------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on port ${PORT}`)
);
