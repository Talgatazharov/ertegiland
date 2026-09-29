import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Check,
  RotateCcw,
  Save,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { characters, getCharacter } from "../data/characters";
import { Badge, ErrorNotice, Loading, PageHeading } from "../components/Common";
import { Portrait } from "../components/Portrait";
import { SceneArt, sceneNames } from "../components/SceneArt";
import { continueStory } from "../services/aiService";
import {
  createSession,
  appendChapter,
  sessionToBook,
} from "../services/storyEngine";
import { storage } from "../services/storageService";
import type { ErrorKind, StoryChoice, StorySession } from "../types";
const stages = [
  "Кіріспе",
  "Жұмбақ",
  "Жаңа серік",
  "Маңызды таңдау",
  "Шарықтау",
  "Қорытынды",
];
export function InteractiveStoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restored] = useState(storage.session);
  const c = getCharacter(id ?? restored?.characterId);
  const [session, setSession] = useState<StorySession>(() =>
    restored?.characterId === c.id ? restored : createSession(c.id),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKind>();
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const pending = useRef(false);
  const active = useRef(true);
  const stageRef = useRef<HTMLElement>(null);
  const failed = useRef<{ session: StorySession; choice: StoryChoice } | null>(
    null,
  );
  const chapter = session.chapters.at(-1)!;
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    storage.saveSession(session);
  }, [session]);
  async function choose(choice: StoryChoice, base = session) {
    if (pending.current || base.currentChapter >= 6) return;
    pending.current = true;
    setBusy(true);
    setSelected(choice.id);
    setError(undefined);
    try {
      const result = await continueStory(base, choice);
      const next = appendChapter(base, choice, result.data, result.source);
      if (!active.current) return;
      failed.current = result.error ? { session: base, choice } : null;
      setSession(next);
      setSaved(false);
      if (result.data.isEnding) storage.unlock("journey");
      setError(result.error);
      requestAnimationFrame(() =>
        stageRef.current?.scrollIntoView({
          block: "start",
          behavior: "smooth",
        }),
      );
    } catch {
      if (active.current) setError("invalid_json");
    } finally {
      pending.current = false;
      if (active.current) {
        setBusy(false);
        setSelected(null);
      }
    }
  }
  function openBook() {
    const book = sessionToBook(session);
    const stored = storage.saveBook(book);
    if (stored) storage.unlock("book");
    navigate("/book/" + book.id, { state: { book } });
  }
  function saveBook() {
    const success = storage.saveBook(sessionToBook(session));
    setSaved(success);
    if (success) storage.unlock("book");
  }
  function restart() {
    const next = createSession(c.id);
    setSession(next);
    setConfirm(false);
    setSaved(false);
    setError(undefined);
    failed.current = null;
    stageRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  if (id && !characters.some((v) => v.id === id))
    return (
      <div className="page container">
        <PageHeading title="Кейіпкер табылмады" />
      </div>
    );
  return (
    <div
      className={"story-experience scene-" + chapter.scene}
      style={{ "--accent": c.accent } as CSSProperties}
    >
      <div className="container story-container">
        <div className="story-topbar">
          <Link className="back" to={"/characters/" + c.id}>
            <ArrowLeft size={16} /> Кейіпкерге оралу
          </Link>
          <span>
            <Sparkles size={15} /> СЕНІҢ ТАҢДАУЫҢ — СЕНІҢ ЕРТЕГІҢ
          </span>
        </div>
        <div className="stage-progress" aria-label="Сапар кезеңдері">
          {stages.map((stage, i) => (
            <div
              key={stage}
              className={
                i + 1 === session.currentChapter
                  ? "current"
                  : i + 1 < session.currentChapter
                    ? "complete"
                    : ""
              }
            >
              <span>{i + 1 < session.currentChapter ? "✓" : i + 1}</span>
              <small>{stage}</small>
            </div>
          ))}
        </div>
        <div className="story-layout">
          <aside className="journey-panel">
            <div className="journey-character">
              <Portrait character={c} small />
              <div>
                <small>СЕНІҢ СЕРІГІҢ</small>
                <h2>{c.name}</h2>
              </div>
            </div>
            <h3>Сенің саяхат жолың</h3>
            <ol>
              <li>🌄 Бастау</li>
              {session.choices.map((v, i) => (
                <li key={i}>
                  <small>{i + 2}-бөлім</small>
                  {v.emoji} {v.text}
                </li>
              ))}
            </ol>
            <details className="memory-panel" open>
              <summary>Сапар қоржыны</summary>
              <h4>Табылған заттар</h4>
              {chapter.memory.items.length ? (
                <ul>
                  {chapter.memory.items.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              ) : (
                <p>Алғашқы жаңалық алда...</p>
              )}
              {chapter.memory.allies.length > 0 && (
                <>
                  <h4>Серіктер</h4>
                  <p>{chapter.memory.allies.join(" · ")}</p>
                </>
              )}
              {chapter.memory.discoveries.length > 0 && (
                <>
                  <h4>Есте сақтайық</h4>
                  <p>{chapter.memory.discoveries.at(-1)}</p>
                </>
              )}
            </details>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => setConfirm(true)}
            >
              <RotateCcw size={15} /> Қайта бастау
            </button>
            {confirm && (
              <div className="confirm-box">
                <p>Жаңа жолды бастаймыз ба? Сақталған кітаптарың қалады.</p>
                <button className="button secondary" onClick={restart}>
                  Иә, бастау
                </button>
                <button
                  className="text-button"
                  onClick={() => setConfirm(false)}
                >
                  Бас тарту
                </button>
              </div>
            )}
          </aside>
          <section
            className="story-paper story-stage"
            ref={stageRef}
            aria-busy={busy}
          >
            <div className="stage-landscape">
              <SceneArt scene={chapter.scene} />
              <div className="stage-landscape-copy">
                <span>{sceneNames[chapter.scene]}</span>
                <h1>{chapter.title}</h1>
              </div>
              <div className="stage-character-seal">
                <Portrait character={c} small />
              </div>
            </div>
            <div className="stage-content">
              <div className="story-meta">
                <Badge source={chapter.source ?? session.source} />
                <span>Оқиға: {session.currentChapter} / 6</span>
              </div>
              <progress
                value={session.currentChapter}
                max={6}
                aria-label="Оқиға барысы"
              />
              <div
                className="chapter-body"
                key={session.currentChapter}
                aria-live="polite"
              >
                <p className="atmosphere">{chapter.atmosphere}</p>
                <div className="story-text">
                  {chapter.story.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <blockquote className="story-dialogue">
                  {chapter.dialogue}
                </blockquote>
              </div>
              {busy ? (
                <Loading text="ЖИ ертегінің келесі бетін жазып жатыр..." />
              ) : (
                <ErrorNotice
                  error={error}
                  retry={
                    failed.current
                      ? () => {
                          const f = failed.current!;
                          void choose(f.choice, f.session);
                        }
                      : undefined
                  }
                />
              )}
              {!chapter.isEnding ? (
                <div className="choice-list story-paths">
                  <div className="choice-heading">
                    <span>КЕЛЕСІ ПАРАҚТЫ ӨЗІҢ ТАҢДА</span>
                    <h2>Не істейміз?</h2>
                  </div>
                  <div className="choice-grid">
                    {chapter.choices.map((choice, i) => (
                      <button
                        key={choice.id}
                        disabled={busy}
                        className={selected === choice.id ? "selected" : ""}
                        onClick={() => void choose(choice)}
                      >
                        <small>0{i + 1} / ЖОЛ</small>
                        <span className="choice-emoji">{choice.emoji}</span>
                        <strong>{choice.text}</strong>
                        <b>Осы жолды таңдау ↗</b>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="ending cinematic-ending">
                  <span className="ending-star">✦</span>
                  <div className="eyebrow">САЯХАТ АЯҚТАЛДЫ</div>
                  <h2>Жарайсың, саяхатшы!</h2>
                  <p>
                    Сенің таңдауларың {c.name} кейіпкерін осы шешімге жеткізді.
                  </p>
                  <div className="final-path">
                    <span>🌄 Бастау</span>
                    {session.choices.map((v, i) => (
                      <span key={i}>
                        {v.emoji} {v.text}
                      </span>
                    ))}
                    <span>🏆 Жеңіс</span>
                  </div>
                  <div className="ending-actions">
                    <button className="button gold" onClick={openBook}>
                      <BookOpen size={18} /> Ертегімді оқу
                    </button>
                    <button className="button ghost" onClick={saveBook}>
                      {saved ? <Check size={18} /> : <Save size={18} />}{" "}
                      {saved ? "Кітапханаға сақталды" : "Кітапханаға сақтау"}
                    </button>
                    <button
                      className="button ghost"
                      onClick={() => setConfirm(true)}
                    >
                      <RotateCcw size={17} /> Басқа жолды таңдау
                    </button>
                  </div>
                  {confirm && (
                    <div className="ending-restart">
                      <p>Саяхатты жаңадан бастаймыз ба?</p>
                      <button className="button gold" onClick={restart}>
                        Иә, бастау
                      </button>
                      <button
                        className="button ghost"
                        onClick={() => setConfirm(false)}
                      >
                        Бас тарту
                      </button>
                    </div>
                  )}
                </div>
              )}
              {session.currentChapter > 1 && (
                <details className="story-history">
                  <summary>Алдыңғы бөлімдерді оқу</summary>
                  {session.chapters.slice(0, -1).map((ch) => (
                    <div key={ch.chapter}>
                      <Badge source={ch.source ?? session.source} />
                      <h3>
                        {ch.chapter}. {ch.title}
                      </h3>
                      <p>{ch.story}</p>
                      <blockquote>{ch.dialogue}</blockquote>
                    </div>
                  ))}
                </details>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
