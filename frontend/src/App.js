import { useState } from "react";
import SpeechToText from "./components/SpeechToText";
import AIChat from "./components/AIChat";
import TextToSpeech from "./components/TextToSpeech";
import LanguageSelector from "./components/LanguageSelector";

function App() {
  const [userText, setUserText] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [language, setLanguage] = useState("English");

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>🤖 AI Voice Assistant</h2>

      <LanguageSelector
        language={language}
        setLanguage={setLanguage}
      />

      <SpeechToText setUserText={setUserText} />

      <AIChat
        userText={userText}
        language={language}
        setAiReply={setAiReply}
      />

      <TextToSpeech
        text={aiReply}
        language={language}
      />

      <p><b>You:</b> {userText}</p>
      <p><b>AI:</b> {aiReply}</p>
    </div>
  );
}

export default App;
