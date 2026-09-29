import { useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  BookOpen,
  Check,
  Palette,
  Printer,
  Save,
  RefreshCw,
} from "lucide-react";
import { Badge, Empty, ErrorNotice, Loading } from "../components/Common";
import { Portrait } from "../components/Portrait";
import { SceneArt } from "../components/SceneArt";
import { getCharacter } from "../data/characters";
import { storage } from "../services/storageService";
import { generateStory, generateStoryTitle } from "../services/aiService";
import { generateStoryIllustration } from "../services/imageService";
import type { ErrorKind, SavedBook, StoryOptions } from "../types";
export function StoryResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as {
    book?: SavedBook;
    error?: ErrorKind;
    options?: StoryOptions;
  } | null;
  const [book, setBook] = useState<SavedBook | undefined>(
    () => storage.books().find((b) => b.id === id) ?? state?.book,
  );
  const [saved, setSaved] = useState(() =>
    storage.books().some((b) => b.id === id),
  );
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<ErrorKind | undefined>(state?.error);
  const [imageDemo, setImageDemo] = useState(false);
  const pending = useRef(false);
  function persist(next: SavedBook) {
    setBook(next);
    setSaved(storage.saveBook(next));
  }
  async function illustrate() {
    if (!book || pending.current) return;
    pending.current = true;
    setBusy("Суретші ЖИ иллюстрация дайындап жатыр...");
    const r = await generateStoryIllustration(book);
    persist({ ...book, illustration: r.data });
    setImageDemo(r.source === "demo");
    setError(r.error);
    setBusy("");
    pending.current = false;
  }
  async function retitle() {
    if (!book || pending.current) return;
    pending.current = true;
    setBusy("Кітабыңа жаңа атау ойластырып жатыр...");
    const r = await generateStoryTitle(
      book.chapters.map((v) => v.text).join(" "),
    );
    persist({ ...book, title: r.data, titleSource: r.source });
    setError(r.error);
    setBusy("");
    pending.current = false;
  }
  async function retry() {
    if (!book || !state?.options || pending.current) return;
    pending.current = true;
    setBusy("Ертегі парақтары жазылып жатыр...");
    const r = await generateStory(state.options);
    persist({ ...book, ...r.data, source: r.source });
    setError(r.error);
    setBusy("");
    pending.current = false;
  }
  if (!book)
    return (
      <div className="page container">
        <Empty title="Бұл кітап табылмады">
          <p>
            Кітап басқа браузерде сақталуы мүмкін. Жаңа ертегі құрастырып көр.
          </p>
          <Link className="button primary" to="/create">
            Ертегі құрастыру
          </Link>
        </Empty>
      </div>
    );
  const c = getCharacter(book.characterId);
  return (
    <div className="page container book-page">
      <div className="book-toolbar">
        <Link className="inline-link" to="/library">
          ← Менің кітапханам
        </Link>
        <div>
          <button
            className="button secondary"
            disabled={!!busy}
            onClick={() => setSaved(storage.saveBook(book))}
          >
            {saved ? <Check size={18} /> : <Save size={18} />}{" "}
            {saved ? "Сақталды" : "Кітапханаға сақтау"}
          </button>
          <button className="button primary" onClick={() => window.print()}>
            <Printer size={18} /> PDF / Басып шығару
          </button>
        </div>
      </div>
      <ErrorNotice
        error={error}
        retry={state?.options && !busy ? () => void retry() : undefined}
      />
      {busy && <Loading text={busy} />}
      <article className="book">
        <div className="book-cover">
          <span className="eyebrow">МЕНІҢ ЖИ ЕРТЕГІМ</span>
          <BookOpen size={34} />
          <h1>{book.title}</h1>
          {book.titleSource && <Badge source={book.titleSource} kind="title" />}
          <p>{c.name}</p>
          <div className="book-character">
            <Portrait character={c} priority />
          </div>
          <div className="book-author">
            Автор: <strong>Жас зерттеуші</strong>
          </div>
          <Badge source={book.source} />
          <small>
            {book.source === "ai"
              ? "Бұл ертегі жасанды интеллект көмегімен құрастырылды."
              : "Бұл кітапта алдын ала дайындалған демо бөлімдер бар."}{" "}
            Әр бөлімнің белгісі оның қайдан алынғанын көрсетеді. Түпнұсқа халық
            ертегісі емес.
          </small>
        </div>
        <div className="book-content">
          {book.illustration && (
            <figure className="book-illustration">
              <img
                src={book.illustration}
                alt={book.title + " — қосымша иллюстрация"}
                width={1024}
                height={1024}
                loading="lazy"
              />
              <figcaption>Ертегі әлемінің көркем иллюстрациясы</figcaption>
            </figure>
          )}
          {book.chapters.map((ch, i) => (
            <section className="book-chapter" key={i}>
              <span className="chapter-num">0{i + 1}</span>
              <h2>{ch.title}</h2>
              <Badge source={ch.source ?? book.source} />
              <SceneArt
                scene={
                  ch.scene ??
                  (i === 0 ? "steppe" : i === 1 ? "forest" : "village")
                }
              />
              {ch.atmosphere && (
                <p className="chapter-atmosphere">{ch.atmosphere}</p>
              )}
              <p>{ch.text}</p>
              {ch.dialogue && (
                <blockquote className="story-dialogue">
                  {ch.dialogue}
                </blockquote>
              )}
              {ch.decision && (
                <div className="chapter-choice">
                  <span>МЕНІҢ ШЕШІМІМ</span>
                  {ch.decision}
                </div>
              )}
            </section>
          ))}
          <section className="moral">
            <span aria-hidden="true">✦</span>
            <h2>Ертегіден қандай ой түюге болады?</h2>
            <p>{book.moral}</p>
          </section>
          {book.choices.length > 0 && (
            <section className="book-path">
              <h3>Менің таңдаған жолым</h3>
              <ol>
                {book.choices.map((choice, i) => (
                  <li key={i}>{choice}</li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </article>
      <div className="book-actions">
        <button
          className="button secondary"
          disabled={!!busy}
          onClick={() => void illustrate()}
        >
          <Palette size={19} /> Иллюстрация жасау
        </button>
        <button
          className="button secondary"
          disabled={!!busy}
          onClick={() => void retitle()}
        >
          <RefreshCw size={17} /> Жаңа атау ұсыну
        </button>
        <Link className="button primary" to="/create">
          Тағы бір ертегі құрастыру
        </Link>
      </div>
      {imageDemo && (
        <p className="muted centered">
          Дайын иллюстрация көрсетілді. ЖИ сурет генерациясы қосылмаған немесе
          қолжетімсіз.
        </p>
      )}
    </div>
  );
}
