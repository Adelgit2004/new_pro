import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.resolve();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------- API ROUTES ---------- */

app.post("/api/chat", async (req, res) => {
  const { message, language } = req.body;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `Reply naturally in ${language}` },
      { role: "user", content: message },
    ],
  });

  res.json({ reply: completion.choices[0].message.content });
});

app.post("/api/tts", async (req, res) => {
  const { text, voiceId } = req.body;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    }
  );

  const audio = await response.arrayBuffer();
  res.set("Content-Type", "audio/mpeg");
  res.send(Buffer.from(audio));
});

/* ---------- SERVE FRONTEND ---------- */
app.use(express.static(path.join(__dirname, "frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

