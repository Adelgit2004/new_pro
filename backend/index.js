import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json({ limit: "1mb" }));

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.send("✅ AI Voice Backend is running");
});

/* -------------------- AI CHAT ENDPOINT -------------------- */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "Invalid message" });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY missing");
      return res.status(500).json({ reply: "Server configuration error" });
    }

    const systemPrompt =
      language === "Malayalam"
        ? "Translate Malayalam to English and reply naturally"
        : `Reply naturally in ${language}`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 200,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("❌ OpenAI Error:", errText);
      return res.status(500).json({ reply: "AI response not available" });
    }

    const data = await openaiResponse.json();

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "AI response not available";

    res.json({ reply });
  } catch (error) {
    console.error("🔥 Chat Endpoint Error:", error);
    res.status(500).json({ reply: "AI response not available" });
  }
});

/* -------------------- TEXT TO SPEECH ENDPOINT -------------------- */
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Invalid text for TTS" });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("❌ ELEVENLABS_API_KEY missing");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const voices = {
      English: "EXAVITQu4vr4xnSDxMaL",
      Hindi: "pNInz6obpgDQGcFmaJgB",
      Spanish: "TxGEqnHWrfWFTfGW9XjX",
      Malayalam: "EXAVITQu4vr4xnSDxMaL", // fallback
    };

    const voiceId = voices[language] || voices.English;

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      console.error("❌ ElevenLabs Error:", errText);
      return res.status(500).json({ error: "TTS failed" });
    }

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

    if (!audioBuffer.length) {
      return res.status(500).json({ error: "Empty audio response" });
    }

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
      "Cache-Control": "no-store",
    });

    res.send(audioBuffer);
  } catch (error) {
    console.error("🔥 TTS Endpoint Error:", error);
    res.status(500).json({ error: "TTS failed" });
  }
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
