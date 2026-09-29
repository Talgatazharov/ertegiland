import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CharacterProfile } from "../types";
import { Portrait } from "./Portrait";
export function CharacterCard({
  character,
  index = 0,
}: {
  character: CharacterProfile;
  index?: number;
}) {
  const c = character;
  return (
    <article
      className={"character-card character-showcase " + c.color}
      style={{ "--accent": c.accent } as CSSProperties}
    >
      <Link
        className="portrait-wrap"
        to={"/characters/" + c.id}
        aria-label={c.name + ": кейіпкерді таңдау"}
      >
        <span className="character-number">0{index + 1}</span>
        <Portrait character={c} />
        <span className="character-tag">{c.role}</span>
        <span className="portrait-spark" aria-hidden="true">
          ✦
        </span>
      </Link>
      <div className="character-card-copy">
        <Link to={"/characters/" + c.id}>
          <h3>{c.name}</h3>
        </Link>
        <p className="character-traits">{c.personality.join(" · ")}</p>
        <p className="character-invitation">«{c.invitation}»</p>
        <div className="card-actions">
          <Link className="button primary" to={"/story/" + c.id}>
            <Sparkles size={16} /> Оқиғаны бастау
          </Link>
          <Link
            className="card-about"
            to={"/characters/" + c.id}
            aria-label={c.name + " туралы"}
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </article>
  );
}
