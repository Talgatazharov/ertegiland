import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { characters } from "../data/characters";
import { quizzes } from "../data/quizzes";
import { generateQuiz } from "../services/aiService";
import { storage } from "../services/storageService";
import { Badge, ErrorNotice, Loading, PageHeading } from "../components/Common";
import type { ErrorKind, QuizQuestion, Source } from "../types";
export function QuizPage() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [ai, setAI] = useState<QuizQuestion | null>(null);
  const [source, setSource] = useState<Source>("demo");
  const [character, setCharacter] = useState("aldar");
  const [bookId, setBookId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKind>();
  const pending = useRef(false);
  const answered = useRef(new Set<number>());
  const books = storage.books();
  const q = ai ?? quizzes[index];
  function pick(i: number) {
    if (correct) return;
    setAnswer(i);
    if (i === q.correctIndex) {
      setCorrect(true);
      if (!ai && !answered.current.has(index)) {
        answered.current.add(index);
        setScore((v) => v + 1);
      }
      storage.markCorrect(ai ? "ai:" + q.question : "static:" + index);
    }
  }
  function next() {
    setAnswer(null);
    setCorrect(false);
    if (ai) {
      setAI(null);
      return;
    }
    if (index === quizzes.length - 1) setDone(true);
    else setIndex((v) => v + 1);
  }
  async function askAI() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    const selected = books.find((v) => v.id === bookId);
    const r = await generateQuiz(
      selected?.characterId ?? character,
      selected?.chapters
        .map((v) => v.text)
        .join(" ")
        .slice(0, 12000),
    );
    setAI(r.data);
    setSource(r.source);
    setAnswer(null);
    setCorrect(false);
    setDone(false);
    setError(r.error);
    setBusy(false);
    pending.current = false;
  }
  return (
    <div className="page container narrow">
      <PageHeading eyebrow="ОЙНАП ҮЙРЕНЕЙІК" title="Кім екенін тап!">
        Ертегі кейіпкерлерін қаншалықты жақсы білесің? Бірге тексерейік.
      </PageHeading>
      {done ? (
        <div className="quiz-card centered">
          <div className="celebration">🏆</div>
          <h2>Жарайсың, жас білгір!</h2>
          <p>
            {quizzes.length} сұрақтың {score} сұрағына дұрыс жауап таптың.
          </p>
          <button
            className="button primary"
            onClick={() => {
              setIndex(0);
              setScore(0);
              answered.current.clear();
              setDone(false);
              setAnswer(null);
              setCorrect(false);
            }}
          >
            Қайта ойнау
          </button>
          <Link to="/library" className="button quiet">
            Жетістіктерімді көру
          </Link>
        </div>
      ) : (
        <section className="quiz-card">
          <div className="story-meta">
            {ai ? <Badge source={source} /> : <Badge traditional />}
            <span>{ai ? "ЖИ сұрағы" : index + 1 + " / " + quizzes.length}</span>
          </div>
          <progress
            value={index + 1}
            max={quizzes.length}
            aria-label="Сұрақтар барысы"
          />
          {busy ? (
            <Loading text="ЖИ қызықты сұрақ ойластырып жатыр..." />
          ) : (
            <>
              <h2>{q.question}</h2>
              <div className="quiz-answers">
                {q.answers.map((a, i) => (
                  <button
                    key={i}
                    disabled={correct}
                    className={
                      answer === i ? (correct ? "correct" : "incorrect") : ""
                    }
                    onClick={() => pick(i)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {a}
                  </button>
                ))}
              </div>
              {answer !== null && (
                <div
                  className={"quiz-feedback " + (correct ? "success" : "")}
                  role="status"
                >
                  {correct ? (
                    <>
                      <h3>Дұрыс! 🎉</h3>
                      <p>{q.explanation}</p>
                      <button className="button primary" onClick={next}>
                        {ai
                          ? "Ойынға оралу"
                          : index === quizzes.length - 1
                            ? "Нәтижені көру"
                            : "Келесі сұрақ"}{" "}
                        <ArrowRight size={18} />
                      </button>
                    </>
                  ) : (
                    <p>Тағы ойланып көр 😊 Сенің қолыңнан келеді!</p>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}
      <ErrorNotice
        error={error}
        retry={busy ? undefined : () => void askAI()}
      />
      <section className="ai-quiz">
        <h3>
          <Sparkles size={21} /> Жаңа сұраққа дайынсың ба?
        </h3>
        <p>Кейіпкер немесе оқыған кітабың бойынша сұрақ ал.</p>
        <div className="select-row">
          <label>
            Кейіпкер
            <select
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
            >
              {characters.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Оқылған кітап
            <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
              <option value="">Кейіпкер туралы сұрақ</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="button secondary"
          disabled={busy}
          onClick={() => void askAI()}
        >
          <Sparkles size={18} /> ЖИ сұрақ қойсын
        </button>
      </section>
    </div>
  );
}
