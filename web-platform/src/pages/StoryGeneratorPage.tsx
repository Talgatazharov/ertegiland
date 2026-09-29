import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import {
  characters,
  getCharacter,
  moods,
  places,
  problems,
} from "../data/characters";
import { Portrait } from "../components/Portrait";
import { PageHeading, Loading } from "../components/Common";
import { generateStory } from "../services/aiService";
import { storage } from "../services/storageService";
import type { StoryOptions, SavedBook, Scene } from "../types";
export function StoryGeneratorPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [options, setOptions] = useState<StoryOptions>({
    characterId: getCharacter(params.get("character") ?? undefined).id,
    place: places[0],
    problem: problems[0],
    mood: moods[0],
  });
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function create() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    const r = await generateStory(options);
    const book: SavedBook = {
      ...r.data,
      chapters: r.data.chapters.map((ch) => ({
        ...ch,
        source: r.source,
        scene: (options.place === "Ғарыш"
          ? "sky"
          : options.place === "Сиқырлы орман"
            ? "forest"
            : options.place === "Таулар әлемі"
              ? "mountain"
              : options.place === "Қазақ даласы"
                ? "steppe"
                : "village") as Scene,
      })),
      id: crypto.randomUUID(),
      characterId: options.characterId,
      createdAt: new Date().toISOString(),
      source: r.source,
      choices: [options.place, options.problem, options.mood],
    };
    storage.unlock("generator");
    storage.unlock("book");
    storage.saveBook(book);
    navigate("/book/" + book.id, { state: { book, error: r.error, options } });
  }
  return (
    <div className="page container">
      <PageHeading
        eyebrow="СЕН — ЕРТЕГІ АВТОРЫСЫҢ"
        title="Қиялыңнан ертегі құрастыр"
      >
        Төрт таңдау жаса. Қалғанын қиял мен ЖИ бірге өрбітеді.
      </PageHeading>
      <div className="generator-layout">
        <form
          className="generator-form"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <fieldset disabled={busy}>
            <legend>
              <span>01</span> Басты кейіпкер кім?
            </legend>
            <div className="character-picker">
              {characters.map((c) => (
                <label
                  className={options.characterId === c.id ? "selected" : ""}
                  key={c.id}
                >
                  <input
                    type="radio"
                    name="character"
                    value={c.id}
                    checked={options.characterId === c.id}
                    onChange={() =>
                      setOptions({ ...options, characterId: c.id })
                    }
                  />
                  <Portrait character={c} small />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {(
            [
              { key: "place", title: "Оқиға қайда болады?", values: places },
              {
                key: "problem",
                title: "Қандай тапсырма күтіп тұр?",
                values: problems,
              },
              {
                key: "mood",
                title: "Ертегінің көңіл күйі қандай?",
                values: moods,
              },
            ] as const
          ).map((group, i) => (
            <fieldset key={group.key} disabled={busy}>
              <legend>
                <span>0{i + 2}</span> {group.title}
              </legend>
              <div className="option-picker">
                {group.values.map((value) => (
                  <label
                    key={value}
                    className={options[group.key] === value ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name={group.key}
                      checked={options[group.key] === value}
                      onChange={() =>
                        setOptions({ ...options, [group.key]: value })
                      }
                    />
                    {value}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {busy ? (
            <Loading />
          ) : (
            <button className="button primary" type="submit">
              <Sparkles size={20} /> Ертегімді жаса <ArrowRight size={18} />
            </button>
          )}
        </form>
        <aside className="generator-preview">
          <Portrait character={getCharacter(options.characterId)} />
          <div>
            <span className="eyebrow">СЕНІҢ БОЛАШАҚ КІТАБЫҢ</span>
            <h2>{getCharacter(options.characterId).name}</h2>
            <p>{options.place}</p>
            <div className="tags">
              <span>{options.mood}</span>
              <span>3 бөлім</span>
            </div>
            <small>
              Әр ертегі — жаңа қиял. Ол халық ертегісінің түпнұсқасы емес.
            </small>
          </div>
        </aside>
      </div>
    </div>
  );
}
