import { z } from "zod";
import {
  bookSchema,
  characterIds,
  choiceSchema,
  sessionSchema,
} from "../types";
import type { SavedBook, StorySession } from "../types";
const prefix = "ertegiland.v1.";
let warning = false;
export const hasStorageWarning = () => warning;
function report() {
  warning = true;
  setTimeout(() => window.dispatchEvent(new Event("storage-warning")), 0);
}
const legacySession = z.object({
  id: z.string(),
  characterId: z.enum(characterIds),
  chapters: z
    .array(
      z.object({
        story: z.string(),
        choices: z.array(choiceSchema),
        isEnding: z.boolean(),
      }),
    )
    .min(1)
    .max(6),
  choices: z.array(choiceSchema).max(5),
  source: z.enum(["ai", "demo"]),
});
export function migrateSession(value: unknown): StorySession | null {
  const current = sessionSchema.safeParse(value);
  if (current.success) return current.data;
  const legacy = legacySession.safeParse(value);
  if (!legacy.success) return null;
  const old = legacy.data;
  const upgraded = {
    ...old,
    createdAt: new Date(0).toISOString(),
    currentChapter: old.chapters.length,
    chapters: old.chapters.map((ch, i) => ({
      ...ch,
      chapter: i + 1,
      title: i === 0 ? "Бұрын басталған ертегі" : i + 1 + "-бөлім",
      dialogue: "Бұрынғы сапардың мәтіні сол күйінде сақталды.",
      atmosphere: "Сиқырлы кітаптың бұрынғы парағы қайта ашылды.",
      scene: "steppe" as const,
      memory: { items: [], allies: [], discoveries: [] },
      source: old.source,
    })),
  };
  const parsed = sessionSchema.safeParse(upgraded);
  return parsed.success ? parsed.data : null;
}
function read<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(prefix + key);
    if (!raw) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      report();
      return fallback;
    }
    return parsed.data;
  } catch {
    report();
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(prefix + key, JSON.stringify(value));
    window.dispatchEvent(new Event("progress-change"));
    return true;
  } catch {
    report();
    return false;
  }
}
export const storage = {
  books: () => read("books", z.array(bookSchema), []),
  saveBook: (book: SavedBook) => {
    const parsed = bookSchema.safeParse(book);
    if (!parsed.success) {
      report();
      return false;
    }
    const books = storage.books();
    return write("books", [
      parsed.data,
      ...books.filter((b) => b.id !== book.id),
    ]);
  },
  removeBook: (id: string) =>
    write(
      "books",
      storage.books().filter((b) => b.id !== id),
    ),
  session: (): StorySession | null => {
    try {
      const raw = localStorage.getItem(prefix + "session");
      if (!raw) return null;
      const session = migrateSession(JSON.parse(raw));
      if (!session) report();
      return session;
    } catch {
      report();
      return null;
    }
  },
  saveSession: (session: StorySession) => write("session", session),
  achievements: () => read("achievements", z.array(z.string()), []),
  unlock: (id: string) => {
    const ids = storage.achievements();
    if (!ids.includes(id)) write("achievements", [...ids, id]);
  },
  correct: () => read("correct", z.array(z.string()), []),
  markCorrect: (id: string) => {
    const ids = storage.correct();
    if (!ids.includes(id)) {
      const next = [...ids, id];
      write("correct", next);
      if (next.length >= 5) storage.unlock("quiz");
    }
  },
};
