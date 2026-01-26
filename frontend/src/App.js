import { useState } from "react";

const voices = {
  English: "EXAVITQu4vr4xnSDxMaL",
  Hindi: "pNInz6obpgDQGcFmaJgB",
  Spanish: "TxGEqnHWrfWFTfGW9XjX",
  Malayalam: "EXAVITQu4vr4xnSDxMaL",
};

export default function App() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [language, setLanguage] = useState("English");

  const backendURL = "https://new-pro-32.onrender.com" // Replace with deployed backend

  const sendToAI = async () => {
    try {
      const res = await fetch(`${backendURL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language }),
      });
      const data = await res.json();
      setReply(data.reply);
      speakAI(data.reply);
    } catch (err) {
      console.error("Chat Error:", err);
      setReply("AI service failed");
    }
  };

 const speakAI = async (aiText) => {
  try {
    const res = await fetch(`${backendURL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: aiText, language }),
    });

    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("audio")) {
      // 🔊 ElevenLabs audio
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } else {
      // 🗣️ Browser TTS fallback
      const reader = new SpeechSynthesisUtterance(aiText);
      reader.lang =
        language === "Malayalam" ? "ml-IN" :
        language === "Hindi" ? "hi-IN" :
        language === "Spanish" ? "es-ES" : "en-US";

      window.speechSynthesis.speak(reader);
    }
  } catch (err) {
    console.error("TTS Error:", err);

    // 🗣️ Emergency fallback
    const reader = new SpeechSynthesisUtterance(aiText);
    reader.lang =
      language === "Malayalam" ? "ml-IN" :
      language === "Hindi" ? "hi-IN" :
      language === "Spanish" ? "es-ES" : "en-US";

    window.speechSynthesis.speak(reader);
  }
};


  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>🤖 AI Voice Assistant</h2>

      <select onChange={(e) => setLanguage(e.target.value)} value={language}>
        {Object.keys(voices).map((lang) => (
          <option key={lang}>{lang}</option>
        ))}
      </select>

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

