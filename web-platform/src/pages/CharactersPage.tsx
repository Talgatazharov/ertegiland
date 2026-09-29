import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Sparkles, BookOpen } from "lucide-react";
import { characters, getCharacter } from "../data/characters";
import { Portrait } from "../components/Portrait";
import { CharacterCard } from "../components/CharacterCard";
import { Badge, PageHeading } from "../components/Common";
export function CharactersPage() {
  return (
    <div className="showcase-page">
      <div className="page container">
        <PageHeading
          eyebrow="ТОҒЫЗ МІНЕЗ. ТОҒЫЗ ЕРЕКШЕ ӘЛЕМ."
          title="Ертегі достарың сені күтеді"
        >
          Суретіне қарап таныс. Мінезін біліп, өз саяхаттасыңды таңда.
        </PageHeading>
        <div className="character-grid">
          {characters.map((c, i) => (
            <CharacterCard character={c} index={i} key={c.id} />
          ))}
        </div>
        <div className="learn-panel">
          <Badge traditional />
          <h2>Ертегіні таны, қиялды ажырат</h2>
          <p>
            Кейіпкерлердің қысқаша сипаттамалары әдеби бейнені таныстырады.
            Берілген суреттер — көркем интерпретациялар.
          </p>
          <Badge />
          <p>
            Чат пен жаңа оқиғалар — қиялдан туған мазмұн. Олар халық ертегісінің
            түпнұсқа мәтіні емес. Демо режимінде алдын ала жазылған жеке
            сюжеттер көрсетіледі.
          </p>
        </div>
      </div>
    </div>
  );
}
export function CharacterDetailPage() {
  const { id } = useParams();
  const c = getCharacter(id);
  if (!characters.some((v) => v.id === id))
    return (
      <div className="page container">
        <PageHeading title="Кейіпкер табылмады" />
        <Link to="/characters" className="button primary">
          Кейіпкерлерді көру
        </Link>
      </div>
    );
  return (
    <div
      className={"cinematic-detail " + c.color}
      style={{ "--accent": c.accent } as CSSProperties}
    >
      <div className="container">
        <Link className="back detail-back" to="/characters">
          <ArrowLeft size={17} /> Кейіпкерлерге оралу
        </Link>
        <div className="detail-grid">
          <div className="detail-portrait">
            <Portrait character={c} priority />
            <div className="detail-image-caption">
              <span>✧</span>
              {c.image
                ? "Кейіпкердің көркем бейнесі"
                : "Бұрынғы көркем бейне · Архивте суреті жоқ"}
            </div>
          </div>
          <div className="detail-copy">
            <div className="eyebrow">{c.role}</div>
            <h1>{c.name}</h1>
            <p className="lead">{c.shortDescription}</p>
            <div className="tags">
              {c.personality.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <blockquote>«{c.invitation}»</blockquote>
            <p className="detail-style">{c.storyStyle}.</p>
            <div className="stack-actions">
              <Link className="button gold" to={"/story/" + c.id}>
                <Sparkles size={19} /> Оқиғаны бастау
              </Link>
              <Link className="button ghost" to={"/chat/" + c.id}>
                <MessageCircle size={19} /> Кейіпкермен сөйлесу
              </Link>
              <a className="detail-about-link" href="#character-about">
                <BookOpen size={17} /> Кейіпкер туралы ↓
              </a>
            </div>
          </div>
        </div>
        <section id="character-about" className="character-about">
          <div>
            <Badge traditional />
            <h2>{c.storyBackground}</h2>
            <p>{c.description}</p>
            <Link className="inline-link" to={"/create?character=" + c.id}>
              Осы кейіпкермен жаңа ертегі жасау →
            </Link>
          </div>
          <div>
            <h3>Нені бағалайды?</h3>
            <div className="tags">
              {c.values.map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
            <h3>Мәселені қалай шешеді?</h3>
            <p>{c.problemSolvingStyle}.</p>
            <h3>Сенің сапарыңда</h3>
            <div className="tags">
              {c.storyThemes.map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
            <small>Бұл қасиеттер жаңа қиял оқиғасының бағытын анықтайды.</small>
          </div>
        </section>
      </div>
    </div>
  );
}
