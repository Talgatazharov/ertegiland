import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { ErrorKind, Source } from "../types";
export function Badge({
  source = "ai",
  traditional = false,
  kind = "story",
}: {
  source?: Source;
  traditional?: boolean;
  kind?: "story" | "answer" | "title";
}) {
  const subject =
    kind === "answer" ? "жауап" : kind === "title" ? "атау" : "оқиға";
  return (
    <span className={"badge " + (traditional ? "traditional" : "")}>
      {traditional
        ? "📖 Ертегі кейіпкері туралы"
        : source === "demo"
          ? "✧ Дайын демо " + subject
          : "✨ ЖИ құрастырған " + subject}
    </span>
  );
}
export function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <Link to="/characters" className="back">
        <ArrowLeft size={16} /> Кейіпкерлерге оралу
      </Link>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
export function Loading({
  text = "Сиқырлы кітаптың келесі беті ашылуда...",
}: {
  text?: string;
}) {
  return (
    <div className="loading" role="status">
      <Sparkles className="twinkle" />
      <span>{text}</span>
      <span className="loading-dots">✧</span>
    </div>
  );
}
export function ErrorNotice({
  error,
  retry,
}: {
  error?: ErrorKind;
  retry?: () => void;
}) {
  if (!error) return null;
  const messages: Record<ErrorKind, string> = {
    network:
      "Байланыс үзілді. Сиқырлы кітап ЖИ әлемімен байланыса алмады. Дайын ертегі жолын ашамыз ✨",
    timeout: "ЖИ жауабы кешікті. Дайын ертегі жолын ашамыз ✨",
    invalid_json: "Жаңа парақ дұрыс ашылмады. Дайын ертегі жолын ашамыз ✨",
    unavailable:
      "Сиқырлы кітап ЖИ әлемімен байланыса алмады. Дайын ертегі жолын ашамыз ✨",
    safety:
      "Бұл тақырыпты жалғастыра алмаймын. Достық пен жақсылық туралы сөйлесейік.",
  };
  return (
    <div className="notice" role="alert">
      <span>{messages[error]}</span>
      {retry && (
        <button className="text-button" onClick={retry}>
          Қайта көру
        </button>
      )}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <span>📚</span>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
