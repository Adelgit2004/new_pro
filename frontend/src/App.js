import { useState } from "react";
import SpeechToText from "./components/SpeechToText";
import LanguageSelector from "./components/LanguageSelector";

const backendURL = "https://YOUR-BACKEND.onrender.com";

export default function App() {
  const [language, setLanguage] = useState("English");
  const [userText, setUserText] = useState("");
  const [reply, setReply] = useState("");

  const sendToAI = async () => {
    if (!userText) return;

    try {
      const res = await fetch(`${backendURL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, language })
      });

      const data = await res.json();
      setReply(data.reply || "response not available");

      speak(data.reply);

    } catch (err) {
      console.error(err);
    }
  };

  const speak = async (text) => {
    const res = await fetch(`${backendURL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language })
    });

    const audioBlob = await res.blob();
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🤖 AI Voice Assistant</h2>

      {/* 🌍 Language */}
      <LanguageSelector language={language} setLanguage={setLanguage} />

      {/* 🎤 Speech to Text */}
      <SpeechToText language={language} setUserText={setUserText} />

      {/* 📝 User text */}
      <textarea
        rows="3"
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
        placeholder="Speak or type..."
      />

      {/* 🤖 Ask AI */}
      <button onClick={sendToAI}>Ask AI 🔊</button>

      {/* 💬 AI Reply */}
      <p><b>AI:</b> {reply}</p>
    </div>
  );
}
