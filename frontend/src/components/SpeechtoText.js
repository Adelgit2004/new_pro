export default function SpeechToText({ setUserText }) {
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.lang = "ml-IN";
     recognition.lang = "hi-IN";
    recognition.start();

    recognition.onresult = (event) => {
      setUserText(event.results[0][0].transcript);
    };
  };

  return <button onClick={startListening}>🎤 Speak</button>;
}
