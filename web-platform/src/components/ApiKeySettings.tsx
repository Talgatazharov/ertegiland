import { useState } from "react";
import { hasApiKey, setApiKey } from "../services/apiKeyService";
export function ApiKeySettings() {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(hasApiKey);
  const [error, setError] = useState("");
  return <details className="api-key-settings container">
    <summary>API кілті {active ? "· енгізілді" : "· баптау"}</summary>
    <form onSubmit={event => {
      event.preventDefault();
      const key = value.trim();
      if (!/^sk-[A-Za-z0-9_-]{10,500}$/.test(key)) { setError("OpenAI API кілтін толық енгізіңіз (sk-...)."); return; }
      setApiKey(key); setValue(""); setActive(true); setError("");
    }}>
      <label htmlFor="personal-api-key">OpenAI API кілті</label>
      <p>Кілт осы бет ашық тұрған кезде қолданылады. Бетті жаңартқанда өшеді. Сұраныстар жергілікті сервер арқылы жіберіледі.</p>
      <div className="api-key-controls">
        <input id="personal-api-key" type="password" value={value} onChange={event => setValue(event.target.value)} placeholder="sk-..." autoComplete="off" spellCheck={false} maxLength={503} />
        <button className="button primary" type="submit">Қолдану</button>
        {active && <button className="button" type="button" onClick={() => { setApiKey(""); setActive(false); setValue(""); setError(""); }}>Кілтті өшіру</button>}
      </div>
      <p role="status">{error || (active ? "Кілт енгізілді. Жарамдылығы алғашқы ЖИ сұранысында тексеріледі." : "Кілт енгізілмесе, сервер баптауы немесе демо режимі қолданылады.")}</p>
    </form>
  </details>;
}
