export default function SpeechToText({ language, setUserText }) {
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
      language === "Malayalam" ? "ml-IN" :
      language === "Hindi" ? "hi-IN" :
      language === "Spanish" ? "es-ES" :
      "en-US";

    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.start();

    recognition.onresult = (event) => {
      setUserText(event.results[0][0].transcript);
    };
  };

  return <button onClick={startListening}>🎤 Speak</button>;
}
