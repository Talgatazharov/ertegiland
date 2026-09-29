import { chapterSchema, sessionSchema } from "../types";
import type {
  CharacterId,
  SavedBook,
  Source,
  StoryChapter,
  StoryChoice,
  StorySession,
} from "../types";
import { initialChapter } from "./demoService";
import { adventures } from "../data/adventures";
export function createSession(characterId: CharacterId): StorySession {
  return {
    id: crypto.randomUUID(),
    characterId,
    createdAt: new Date().toISOString(),
    currentChapter: 1,
    chapters: [initialChapter(characterId)],
    choices: [],
    source: "demo",
  };
}
export function appendChapter(
  base: StorySession,
  choice: StoryChoice,
  chapter: StoryChapter,
  source: Source,
): StorySession {
  if (
    base.currentChapter >= 6 ||
    !base.chapters
      .at(-1)
      ?.choices.some((c) => c.id === choice.id && c.text === choice.text)
  )
    throw new Error("Invalid story transition");
  const parsed = chapterSchema.parse(chapter);
  if (parsed.chapter !== base.currentChapter + 1)
    throw new Error("Invalid chapter number");
  return sessionSchema.parse({
    ...base,
    currentChapter: parsed.chapter,
    chapters: [...base.chapters, { ...parsed, source }],
    choices: [...base.choices, choice],
    source:
      base.currentChapter === 1
        ? source
        : base.source === "demo" || source === "demo"
          ? "demo"
          : "ai",
  });
}
export function sessionToBook(session: StorySession): SavedBook {
  return {
    id: session.id,
    characterId: session.characterId,
    title: session.chapters[0].title,
    createdAt: session.createdAt,
    chapters: session.chapters.map((ch, i) => ({
      title: ch.title,
      text: ch.story,
      dialogue: ch.dialogue,
      atmosphere: ch.atmosphere,
      scene: ch.scene,
      source: ch.source ?? session.source,
      decision: session.choices[i]
        ? session.choices[i].emoji + " " + session.choices[i].text
        : undefined,
    })),
    moral: adventures[session.characterId].moral,
    source: session.source,
    choices: session.choices.map((c) => c.emoji + " " + c.text),
  };
}
