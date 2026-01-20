import { useState } from "react";
import LanguageSelector from "./components/LanguageSelector";
import SpeechToText from "./components/SpeechToText";

const voices = {
  English: "EXAVITQu4vr4xnSDxMaL",
  Hindi: "pNInz6obpgDQGcFmaJgB",
  Spanish: "TxGEqnHWrfWFTfGW9XjX",
  Malayalam: "EXAVITQu4vr4xnSDxMaL"
};

function App() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [language, setLanguage] = useState("English");

  // Replace with your deployed backend URL after Render deployment
  const backendURL = "https://your-backend-service.onrender.com";

  const sendToAI = async () => {
    const res = await fetch(`${backendURL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, language }),
    });
    const data = await res.json();
    setReply(data.reply);
    speakAI(data.reply);
  };

  const speakAI = async (aiText) => {
    const res = await fetch(`${backendURL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: aiText, voiceId: voices[language] }),
    });
    const blob = await res.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  };

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>🤖 AI Voice Assistant</h2>

      <LanguageSelector language={language} setLanguage={setLanguage} />
      <SpeechToText setUserText={setText} />

      <textarea
        rows="4"
        placeholder="Ask something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", marginTop: 10 }}
      />

      <button onClick={sendToAI} style={{ marginTop: 10 }}>
        Ask AI 🔊
      </button>

      <p><b>AI:</b> {reply}</p>
    </div>
  );
}

export default App;
