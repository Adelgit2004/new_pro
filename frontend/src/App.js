import React, { useState } from "react";
import "./App.css";

const BACKEND_URL = "https://new-pro-14.onrender.com"; // ✅ your backend

function App() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("English");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Ask AI (Chat)
  // -----------------------------
  const askAI = async () => {
    if (!text.trim()) {
      setReply("Please enter some text");
      return;
    }

    setLoading(true);
    setReply("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language }),
      });

      const data = await res.json();
      setReply(data.reply || "AI response not available");

      speakText(data.reply);
    } catch (err) {
      console.error(err);
      setReply("Error connecting to AI");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Text-to-Speech
  // -----------------------------
  const speakText = async (textToSpeak) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, language }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error("Audio error:", err);
    }
  };

  return (
    <div className="container">
      <h1>🤖 AI Voice Assistant</h1>

      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>English</option>
        <option>Hindi</option>
        <option>Spanish</option>
        <option>Malayalam</option>
      </select>

      <textarea
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={askAI} disabled={loading}>
        {loading ? "Thinking..." : "Ask AI 🔊"}
      </button>

      <div className="reply">
        <strong>AI:</strong>
        <p>{reply}</p>
      </div>
    </div>
  );
}

export default App;
