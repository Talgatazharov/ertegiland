import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { achievements } from "../data/quizzes";
import { getCharacter } from "../data/characters";
import { storage } from "../services/storageService";
import { Badge, Empty, PageHeading } from "../components/Common";
export function LibraryPage() {
  const [books, setBooks] = useState(storage.books);
  const [earned, setEarned] = useState(storage.achievements);
  const [deleting, setDeleting] = useState<string | null>(null);
  useEffect(() => {
    const update = () => {
      setBooks(storage.books());
      setEarned(storage.achievements());
    };
    window.addEventListener("progress-change", update);
    return () => window.removeEventListener("progress-change", update);
  }, []);
  return (
    <div className="page container">
      <PageHeading
        eyebrow="ҚИЯЛЫҢНАН ТУҒАН ҚАЗЫНА"
        title="Менің ертегі кітапханам"
      >
        Әр кітап — сенің бір ерекше саяхатың. Қайта ашып, достарыңмен бөліс.
      </PageHeading>
      <div className="section-heading">
        <h2>
          Менің кітаптарым <span className="count">{books.length}</span>
        </h2>
        <Link className="button secondary" to="/create">
          <Plus size={17} /> Жаңа ертегі
        </Link>
      </div>
      {books.length === 0 ? (
        <Empty title="Алғашқы кітабыңа орын дайын">
          <p>Кейіпкерді таңдап, өз ертегіңді құрастыр. Ол осында сақталады.</p>
          <Link className="button primary" to="/create">
            <BookOpen size={18} /> Алғашқы кітабымды жасау
          </Link>
        </Empty>
      ) : (
        <div className="library-grid">
          {books.map((book) => (
            <article className="library-book" key={book.id}>
              <Link to={"/book/" + book.id}>
                <img
                  src={
                    book.illustration ??
                    getCharacter(book.characterId).image ??
                    "/storybook.svg"
                  }
                  alt={book.title}
                  loading="lazy"
                  width={480}
                  height={480}
                />
                <div className="library-book-copy">
                  <Badge source={book.source} />
                  <h3>{book.title}</h3>
                  <p>{getCharacter(book.characterId).name}</p>
                  <span className="card-link">Кітапты оқу →</span>
                </div>
              </Link>
              <div className="library-book-footer">
                <time>
                  {new Date(book.createdAt).toLocaleDateString("kk-KZ")}
                </time>
                <button
                  className="icon-button"
                  aria-label={book.title + " кітабын өшіру"}
                  onClick={() => setDeleting(book.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
              {deleting === book.id && (
                <div className="confirm-box">
                  <p>Бұл кітапты өшіргің келе ме?</p>
                  <button
                    className="button secondary"
                    onClick={() => {
                      if (storage.removeBook(book.id)) {
                        setBooks(storage.books());
                        setDeleting(null);
                      }
                    }}
                  >
                    Иә, өшіру
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setDeleting(null)}
                  >
                    Қалдыру
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      <section className="achievements">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ӘР ҚАДАМ — БІР ЖЕТІСТІК</div>
            <h2>Менің жетістіктерім</h2>
          </div>
          <span>
            {earned.length} / {achievements.length}
          </span>
        </div>
        <div className="achievement-grid">
          {achievements.map((a) => (
            <div
              className={
                "achievement " + (earned.includes(a.id) ? "earned" : "locked")
              }
              key={a.id}
            >
              <span>{a.emoji}</span>
              <h3>{a.name}</h3>
              <p>{a.description}</p>
              <small>
                {earned.includes(a.id) ? "✓ Қол жеткіздің" : "Әлі алда"}
              </small>
            </div>
          ))}
        </div>
      </section>
      <p className="muted">
        Кітаптарың осы браузерде сақталады. Маңызды ертегілеріңді PDF ретінде
        жүктеп ал.
      </p>
    </div>
  );
}
