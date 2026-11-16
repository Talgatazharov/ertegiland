import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { getTale, taleCategories, tales } from "../data/tales";

export function TaleCatalog() {
  return (
    <section className="section tale-catalog" id="tales">
      <div className="section-heading">
        <div>
          <div className="eyebrow">ҮШ САНАТ · ОН ЕКІ ЖАҢА ЕРТЕГІ</div>
          <h2>Ертегілер әлемі</h2>
          <p>
            Қазақ халық ертегілері мазмұнына қарай үш түрге бөлінеді. Осы
            жанрларға сай жаңа оқиғаларды оқып көр.
          </p>
        </div>
      </div>
      <div className="tale-categories">
        {taleCategories.map((category) => (
          <article className="tale-category" key={category.id}>
            <span className="tale-emoji" aria-hidden="true">
              {category.emoji}
            </span>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <ul>
              {tales
                .filter((t) => t.categoryId === category.id)
                .map((t) => (
                  <li key={t.id}>
                    <Link to={"/tales/" + t.id}>
                      <span>{t.title}</span>
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="tale-note">
        Бұл жинақтағы мәтіндер — аталған жанрларға сай жоба үшін жазылған жаңа
        ертегілер.
      </p>
    </section>
  );
}
export function TalesPage() {
  const { id } = useParams();
  const tale = getTale(id);
  if (!id)
    return (
      <div className="page container">
        <h1>Ертегілер жинағы</h1>
        <TaleCatalog />
      </div>
    );
  if (!tale)
    return (
      <div className="page container">
        <h1>Ертегі табылмады</h1>
        <Link to="/tales">Жинаққа оралу</Link>
      </div>
    );
  const category = taleCategories.find((c) => c.id === tale.categoryId)!;
  return (
    <article className="page container narrow tale-reader">
      <Link className="back" to="/tales">
        <ArrowLeft size={16} /> Ертегілерге оралу
      </Link>
      <div className="eyebrow">{category.name}</div>
      <h1>{tale.title}</h1>
      <p className="tale-note">Жобаға арнап жазылған жаңа ертегі</p>
      {tale.chapters.map((chapter, i) => (
        <section className="prose" key={chapter.title}>
          <h2>
            {i + 1}. {chapter.title}
          </h2>
          <p>{chapter.text}</p>
        </section>
      ))}
      <aside className="learn-panel">
        <h2>Ертегіден түйген ой</h2>
        <p>{tale.moral}</p>
      </aside>
      <Link className="button primary" to={"/create?tale=" + tale.id}>
        <Sparkles size={18} /> Осы тақырыпта ертегі құрастыр
      </Link>
    </article>
  );
}
