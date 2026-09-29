import { useState } from "react";
import type { CharacterProfile } from "../types";
import { LegacyPortrait } from "./LegacyPortrait";
export function Portrait({
  character,
  small = false,
  priority = false,
}: {
  character: CharacterProfile;
  small?: boolean;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!character.image || !character.imageSlug)
    return <LegacyPortrait character={character} small={small} />;
  if (failed)
    return (
      <div
        className={"portrait image-unavailable" + (small ? " small" : "")}
        role="img"
        aria-label={character.name + " суреті ашылмады"}
      >
        ✧<span>{character.name}</span>
      </div>
    );
  return (
    <img
      className={"portrait character-image" + (small ? " small" : "")}
      src={character.image}
      srcSet={
        "/characters/" +
        character.imageSlug +
        "-480.webp 480w, " +
        character.image +
        " 960w"
      }
      sizes={
        small
          ? "64px"
          : "(max-width: 600px) calc(100vw - 42px), (max-width: 1000px) 45vw, 420px"
      }
      width={960}
      height={960}
      alt={character.name + " — көркем бейне"}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
