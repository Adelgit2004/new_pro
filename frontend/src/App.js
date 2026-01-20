import { useState } from "react";
import SpeechToText from "./components/SpeechToText";
import LanguageSelector from "./components/LanguageSelector";
import "./App.css"; // your CSS from previous HTML

const voices = {
  English: "EXAVITQu4vr4xnSDxMaL",
  Hindi: "pNInz6obpgDQGcFmaJgB",
  Spanish: "TxGEqnHWrfWFTfGW9XjX",
  Malayalam: "EXAVITQu4vr4xnSDxMaL",
};

function App() {
  const [language, setLanguage] = useState("English");
  const [userText, setUserText] = useState("");
  const [reply, setReply] = useState("");

  const backendURL = "https://new-pro-12.onrender.com"; // your deployed backend

  const sendToAI = async () => {
    if (!userText) return;
    try {
      const res = await fetch(`${backendURL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, language }),
      });
      const data = await res.json();
      setReply(data.reply || "AI response not available");
      speakAI(data.reply || "AI response not available");
    } catch (err) {
      console.error(err);
      setReply("AI response not available");
    }
  };

const speakAI = async (text) => {
  try {
    const res = await fetch(`${backendURL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });

    if (!res.ok) {
      throw new Error("TTS request failed");
    }

    const blob = await res.blob();

    if (!blob.type.includes("audio")) {
      throw new Error("Response is not audio");
    }

    const audioURL = URL.createObjectURL(blob);
    const audio = new Audio(audioURL);
    audio.play();

  } catch (err) {
    console.error("Audio playback failed:", err);
  }
};


  return (
    <div className="container">
      <h2>🤖 AI Voice Assistant</h2>

      <LanguageSelector language={language} setLanguage={setLanguage} />

      <div className="btn-group">
        <SpeechToText language={language} setUserText={setUserText} />
        <button onClick={sendToAI}>Ask AI 🔊</button>
      </div>

      <textarea
        placeholder="Type or speak something..."
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
      />

      <p>
        <b>AI:</b> {reply}
      </p>
    </div>
  );
}

export default App;
