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
import { getTale, taleCategories, tales } from "../data/tales";
export function StoryGeneratorPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [taleId, setTaleId] = useState(getTale(params.get("tale"))?.id ?? "");
  const selectedTale = getTale(taleId);
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
    const r = await generateStory({ ...options, taleId: selectedTale?.id });
    const book: SavedBook = {
      ...r.data,
      taleId: selectedTale?.id,
      chapters: r.data.chapters.map((ch) => ({
        ...ch,
        source: r.source,
        scene: (selectedTale
          ? selectedTale.categoryId === "animals"
            ? "forest"
            : selectedTale.categoryId === "everyday"
              ? "village"
              : "sky"
          : options.place === "Ғарыш"
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
      choices: selectedTale
        ? [
            taleCategories.find((c) => c.id === selectedTale.categoryId)!.name,
            selectedTale.title,
          ]
        : [options.place, options.problem, options.mood],
    };
    storage.unlock("generator");
    storage.unlock("book");
    storage.saveBook(book);
    navigate("/book/" + book.id, {
      state: {
        book,
        error: r.error,
        options: { ...options, taleId: selectedTale?.id },
      },
    });
  }
  return (
    <div className="page container">
      <PageHeading
        eyebrow="СЕН — ЕРТЕГІ АВТОРЫСЫҢ"
        title="Қиялыңнан ертегі құрастыр"
      >
        Жинақтан тақырып таңда немесе өз кейіпкеріңмен жаңа оқиға құрастыр.
      </PageHeading>
      <div className="generator-layout">
        <form
          className="generator-form"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <fieldset disabled={busy} className="tale-select">
            <legend>Ертегінің түрі мен тақырыбы</legend>
            <label htmlFor="tale-topic">Ертегі тақырыбы</label>
            <select
              id="tale-topic"
              value={taleId}
              onChange={(e) => setTaleId(e.target.value)}
            >
              <option value="">Өз тақырыбым — еркін құрастыру</option>
              {taleCategories.map((category) => (
                <optgroup key={category.id} label={category.name}>
                  {tales
                    .filter((t) => t.categoryId === category.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            {selectedTale && (
              <p>
                {
                  taleCategories.find((c) => c.id === selectedTale.categoryId)!
                    .description
                }{" "}
                Басты кейіпкер: {selectedTale.hero}.
              </p>
            )}
          </fieldset>
          {!selectedTale && (
            <>
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
                  {
                    key: "place",
                    title: "Оқиға қайда болады?",
                    values: places,
                  },
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
                        className={
                          options[group.key] === value ? "selected" : ""
                        }
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
            </>
          )}
          {busy ? (
            <Loading />
          ) : (
            <button className="button primary" type="submit">
              <Sparkles size={20} /> Ертегімді жаса <ArrowRight size={18} />
            </button>
          )}
        </form>
        <aside className="generator-preview">
          {!selectedTale && (
            <Portrait character={getCharacter(options.characterId)} />
          )}
          {selectedTale && (
            <span className="tale-emoji" aria-hidden="true">
              {
                taleCategories.find((c) => c.id === selectedTale.categoryId)!
                  .emoji
              }
            </span>
          )}
          <div>
            <span className="eyebrow">СЕНІҢ БОЛАШАҚ КІТАБЫҢ</span>
            <h2>
              {selectedTale?.title ?? getCharacter(options.characterId).name}
            </h2>
            <p>
              {selectedTale
                ? taleCategories.find((c) => c.id === selectedTale.categoryId)!
                    .name
                : options.place}
            </p>
            <div className="tags">
              <span>{selectedTale ? "Жаңа ертегі" : options.mood}</span>
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
