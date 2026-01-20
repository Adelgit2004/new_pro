import { useState } from "react";

export default function TextToSpeech() {
  const [text, setText] = useState("");

  const speak = () => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    // Optional: choose best available voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang === "en-US");
    if (naturalVoice) utterance.voice = naturalVoice;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <textarea
        rows="4"
        placeholder="Enter text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <button onClick={speak}>🔊 Speak</button>
    </div>
  );
}
