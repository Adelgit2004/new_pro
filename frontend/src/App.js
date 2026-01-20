import { useState } from "react";
import SpeechToText from "./components/SpeechToText";
import LanguageSelector from "./components/LanguageSelector";

const backendURL = "https://new-pro-12.onrender.com"; // your deployed backend

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
        body: JSON.stringify({ message: userText, language }),
      });

      const data = await res.json();
      setReply(data.reply || "response not available");

      speak(data.reply);
    } catch (err) {
      console.error(err);
      setReply("response not available");
    }
  };

  const speak = async (text) => {
    if (!text) return;

    try {
      const res = await fetch(`${backendURL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      const audioBlob = await res.blob();
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>🤖 AI Voice Assistant</h2>

      <LanguageSelector language={language} setLanguage={setLanguage} />
      <SpeechToText language={language} setUserText={setUserText} />

      <textarea
        rows="3"
        placeholder="Type or speak something..."
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
        style={{ width: "100%", marginTop: 10 }}
      />

      <button onClick={sendToAI} style={{ marginTop: 10 }}>
        Ask AI 🔊
      </button>

      <p style={{ marginTop: 20 }}>
        <b>AI:</b> {reply}
      </p>
    </div>
  );
}
