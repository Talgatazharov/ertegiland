import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Send, ArrowRight } from "lucide-react";
import { characters, getCharacter } from "../data/characters";
import { Badge, ErrorNotice, Loading, PageHeading } from "../components/Common";
import { Portrait } from "../components/Portrait";
import { chatWithCharacter } from "../services/aiService";
import { storage } from "../services/storageService";
import type { ChatMessage, ErrorKind } from "../types";
export function CharacterChatPage() {
  const { id } = useParams();
  const c = getCharacter(id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKind>();
  const last = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const active = useRef(true);
  const retryMessages = useRef<ChatMessage[]>([]);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    last.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, busy]);
  async function send(text: string, retry = false) {
    if (!text.trim() || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(undefined);
    const next = retry
      ? retryMessages.current
      : [
          ...messages,
          {
            id: crypto.randomUUID(),
            role: "user" as const,
            text: text.trim().slice(0, 1000),
          },
        ];
    retryMessages.current = next;
    if (!retry) {
      setMessages(next);
      setInput("");
    }
    const result = await chatWithCharacter(c.id, next);
    if (active.current) {
      setMessages([
        ...next,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: result.data,
          source: result.source,
        },
      ]);
      setError(result.error);
      setBusy(false);
      storage.unlock("chat");
    }
    pending.current = false;
  }
  if (!characters.some((v) => v.id === id))
    return (
      <div className="page container">
        <PageHeading title="Кейіпкер табылмады" />
      </div>
    );
  return (
    <div className="page container narrow">
      <PageHeading
        eyebrow="СҰРАҚ ҚОЙ. ОЙ БӨЛІС."
        title={c.name + ": еркін әңгіме"}
      >
        Бұл — кейіпкердің мінезіне негізделген қиял әңгіме. Жеке мәліметтеріңді
        жазба.
      </PageHeading>
      <div className="chat-panel">
        <div className="chat-header">
          <Portrait character={c} small />
          <div>
            <h2>{c.name}</h2>
            <span>Ертегі әлеміндегі досың</span>
          </div>
          <span className="status-dot" />
        </div>
        <div className="chat-profile-note">
          {c.speakingStyle}. {c.problemSolvingStyle}.
        </div>
        <div className="messages" aria-live="polite">
          <div className="message assistant">
            <p>{c.greeting}</p>
            <Badge source="demo" kind="answer" />
          </div>
          {messages.map((m) => (
            <div className={"message " + m.role} key={m.id}>
              <p>{m.text}</p>
              {m.role === "assistant" && (
                <Badge source={m.source} kind="answer" />
              )}
            </div>
          ))}
          {busy && <Loading text="Кейіпкерің жауабын ойластырып жатыр..." />}
          <div ref={last} />
        </div>
        <ErrorNotice
          error={error}
          retry={
            busy
              ? undefined
              : () => void send(retryMessages.current.at(-1)?.text ?? "", true)
          }
        />
        <div className="suggestions">
          {c.suggestedQuestions.map((q) => (
            <button disabled={busy} key={q} onClick={() => void send(q)}>
              {q}
            </button>
          ))}
        </div>
        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <label className="sr-only" htmlFor="message">
            Сұрағың
          </label>
          <input
            id="message"
            maxLength={1000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Кейіпкеріңе сұрақ қой..."
            disabled={busy}
          />
          <button
            className="button primary"
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Хабарламаны жіберу"
          >
            <Send size={21} />
          </button>
        </form>
      </div>
      <div className="next-link">
        <Link className="inline-link" to={"/story/" + c.id}>
          Енді бірге оқиғаға аттанайық <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
