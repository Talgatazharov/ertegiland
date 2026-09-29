import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Sparkles,
  BookOpen,
  MessageCircle,
  Route,
  Palette,
  WandSparkles,
} from "lucide-react";
import { characters, getCharacter } from "../data/characters";
import { CharacterCard } from "../components/CharacterCard";
import { Portrait } from "../components/Portrait";
const steps = [
  { icon: BookOpen, title: "Кейіпкерді таңда", text: "Өз серігіңді тап" },
  { icon: MessageCircle, title: "Танысып, сөйлес", text: "Оның мінезін біл" },
  { icon: Route, title: "Жолыңды таңда", text: "Сенің шешімің маңызды" },
  {
    icon: WandSparkles,
    title: "Оқиғаны өзгерт",
    text: "Жаңа парақты бірге аш",
  },
  { icon: Palette, title: "Естелік жаса", text: "Ертегіңе сурет қос" },
  {
    icon: BookOpen,
    title: "Кітабыңды сақта",
    text: "Бұл оқиғаның авторы — сен",
  },
];
export function HomePage() {
  return (
    <div className="home enchanted-home">
      <section className="hero cinematic-hero">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow">
            <span>✦</span> ҰЛТТЫҚ МҰРА. ШЕКСІЗ ҚИЯЛ.
          </div>
          <h1>
            Қазақ ертегілерінің
            <br />
            кейіпкерлері
            <br />
            <em>ЖИ әлемінде</em>
          </h1>
          <p>
            Кейіпкерді таңда.
            <br />
            Оқиғаның бағытын өзгерт.
            <br />
            <strong>Өз ертегіңді жаса.</strong>
          </p>
          <div className="hero-actions">
            <Link className="button gold" to="/characters">
              <Sparkles size={19} /> Ертегі әлеміне кіру{" "}
              <ArrowRight size={18} />
            </Link>
            <a className="button ghost" href="#characters">
              <BookOpen size={18} /> Кейіпкерлерді көру
            </a>
          </div>
          <div className="hero-stats">
            <span>
              <b>09</b> дара кейіпкер
            </span>
            <i>✧</i>
            <span>
              <b>06</b> оқиға кезеңі
            </span>
            <i>✧</i>
            <span>
              <b>∞</b> қиял әлемі
            </span>
          </div>
        </div>
        <div className="hero-gallery">
          <div className="portal-orbit" aria-hidden="true" />
          <div className="hero-image-card hero-secondary">
            <Portrait character={getCharacter("aldar")} priority />
            <span>Тапқырлықтан туған сиқыр</span>
          </div>
          <div className="hero-image-card hero-primary">
            <Portrait character={getCharacter("tostik")} priority />
            <div>
              <span className="eyebrow">СЕНІҢ ЖАҢА САЯХАТЫҢ</span>
              <h2>
                Бір қадам.
                <br />
                Мың ғажайып.
              </h2>
            </div>
          </div>
          <span className="hero-spark one" aria-hidden="true">
            ✦
          </span>
          <span className="hero-spark two" aria-hidden="true">
            ✧
          </span>
          <div className="hero-caption">
            <span>01</span> Алғашқы бет сенен басталады.
          </div>
        </div>
        <a className="scroll-cue" href="#characters">
          <ArrowDown size={17} /> Ертегіге алғашқы қадам
        </a>
      </section>
      <section className="section characters-section" id="characters">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ӘР КЕЙІПКЕР — ӨЗІНШЕ БІР ӘЛЕМ</div>
            <h2>Ертегі кейіпкеріңді таңда</h2>
            <p>
              Бірі ақылмен, бірі батылдықпен, бірі жылы сөзбен жол табады.
              <br />
              Сен қай оқиғаның бір бөлігі болғың келеді?
            </p>
          </div>
          <Link className="inline-link" to="/characters">
            Барлық кейіпкерлер <ArrowRight size={18} />
          </Link>
        </div>
        <div className="character-grid">
          {characters.map((c, i) => (
            <CharacterCard key={c.id} character={c} index={i} />
          ))}
        </div>
      </section>
      <section className="how-section section" id="how">
        <div className="section-heading centered">
          <div>
            <div className="eyebrow">ЖАЙ ОҚЫМА. ОҚИҒАҒА ҚАТЫС.</div>
            <h2>Өз ертегіңе апарар алты қадам</h2>
          </div>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step" key={s.title}>
              <div className="step-icon">
                <s.icon size={25} />
                <small>{i + 1}</small>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="create-banner">
        <div>
          <div className="eyebrow">СИҚЫРЛЫ КІТАПТЫҢ БОС ПАРАҒЫ</div>
          <h2>
            Келесі ертегіні
            <br />
            өзің жаз.
          </h2>
          <p>Кейіпкер, мекен, көңіл күйі — қиялыңның шекарасын өзің белгіле.</p>
          <Link className="button gold" to="/create">
            <Sparkles size={18} /> Ертегімді жасау <ArrowRight size={18} />
          </Link>
        </div>
        <div className="banner-book" aria-hidden="true">
          <span>✦</span>
          <BookOpen size={130} strokeWidth={0.8} />
          <small>
            МЕНІҢ
            <br />
            ЖИ ЕРТЕГІМ
          </small>
        </div>
      </section>
    </div>
  );
}
