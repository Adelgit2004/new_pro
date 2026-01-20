
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// AI chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, language } = req.body;

  // Example response - replace with your LLM logic
  const reply =
    language === "Malayalam"
      ? "Translate Malayalam to English and reply naturally: " + message
      : `AI reply in ${language}: ${message}`;

  res.json({ reply });
});

// Text-to-Speech endpoint
app.post("/api/tts", async (req, res) => {
  const { text, voiceId } = req.body;

  // Replace with your ElevenLabs or TTS API logic
  // For now, returning a dummy audio response
  const audioBuffer = Buffer.from("dummy-audio"); 
  res.setHeader("Content-Type", "audio/mpeg");
  res.send(audioBuffer);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
