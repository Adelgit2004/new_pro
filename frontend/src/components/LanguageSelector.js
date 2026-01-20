const voices = ["English", "Hindi", "Spanish", "Malayalam"];

export default function LanguageSelector({ language, setLanguage }) {
  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      {voices.map((lang) => (
        <option key={lang}>{lang}</option>
      ))}
    </select>
  );
}
