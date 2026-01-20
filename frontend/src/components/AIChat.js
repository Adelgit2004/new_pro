export default function AIChat({ userText, language, setAiReply }) {
  const askAI = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, language }),
    });

    const data = await res.json();
    setAiReply(data.reply);
  };

  return <button onClick={askAI}>Ask AI 🤖</button>;
}
