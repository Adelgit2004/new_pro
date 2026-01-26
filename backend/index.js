import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------
// TTS auto-retry logic
// -------------------------
let ttsEnabled = true;

const disableTTSWithRetry = () => {
  if (!ttsEnabled) return;

  ttsEnabled = false;
  console.log("TTS disabled. Retrying in 5 minutes...");

  setTimeout(() => {
    ttsEnabled = true;
    console.log("TTS re-enabled.");
  }, 5 * 60 * 1000);
};

// -------------------------
// Test endpoint
// -------------------------
app.get("/", (req, res) => {
  res.send("Backend is running! Use /api/chat and /api/tts");
});

// -------------------------
// AI Chat (OpenAI Responses API)
// -------------------------
app.post("/api/chat", async (req, res) => {
  const { message, language } = req.body;

  if (!message) {
    return res.json({ reply: "Please enter a message" });
  }

  try {
    const prompt =
      language === "Malayalam"
        ? `Translate Malayalam to English and reply naturally: ${message}`
        : `Reply naturally in ${language}: ${message}`;

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
    });

    const data = await openaiRes.json();

    let reply = "AI response not available";

    if (data.error) {
      console.error("OpenAI error:", data.error);
      reply = "AI service temporarily unavailable";
    } else {
      reply = data.output_text || reply;
    }

    res.json({ reply });
  } catch (err) {
    console.error("Chat API failed:", err);
    res.json({ reply: "AI service temporarily unavailable" });
  }
});

    const data = await openaiRes.json();

    let reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "AI response not available";

    res.json({ reply });

  } catch (err) {
    console.error("Chat API failed:", err);
    res.json({ reply: "AI service temporarily unavailable" });
  }
});

// -------------------------
// TTS Endpoint (Streaming + Fallback)
// -------------------------
app.post("/api/tts", async (req, res) => {
  const { text, language } = req.body;

  if (!text) {
    return res.json({
      fallback: true,
      message: "No text provided for TTS",
    });
  }

  if (!ttsEnabled) {
    return res.json({
      fallback: true,
      message: "TTS quota exceeded. Use browser TTS.",
    });
  }

  const voices = {
    English: "EXAVITQu4vr4xnSDxMaL",
    Hindi: "pNInz6obpgDQGcFmaJgB",
    Spanish: "TxGEqnHWrfWFTfGW9XjX",
    Malayalam: "EXAVITQu4vr4xnSDxMaL",
  };

  const voiceId = voices[language] || voices.English;

  try {
    const ttsRes = await fetch(
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

    if (!ttsRes.ok) {
      console.error("ElevenLabs TTS failed:", await ttsRes.text());
      disableTTSWithRetry();

      return res.json({
        fallback: true,
        message: "TTS temporarily unavailable. Use browser TTS.",
      });
    }

    // 🔊 STREAM AUDIO
    res.set("Content-Type", "audio/mpeg");
    ttsRes.body.pipe(res);

  } catch (err) {
    console.error("TTS request failed:", err);
    disableTTSWithRetry();

    res.json({
      fallback: true,
      message: "TTS service unavailable. Use browser TTS.",
    });
  }
});

// -------------------------
// Start Server
// -------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
