
import { z } from "zod";
import { chapterSchema, generatedSchema, quizSchema } from "../types";
import type {
  AIResponse,
  ChatMessage,
  ErrorKind,
  StoryChoice,
  StoryOptions,
  StorySession,
} from "../types";
import { demoChat, demoContinue, demoStory } from "./demoService";
import { quizzes } from "../data/quizzes";
export async function requestAI<T>(
  action: string,
  payload: unknown,
  schema: z.ZodType<T>,
  fallback: () => T,
  timeout = 50000,
): Promise<AIResponse<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch("/api/ai/" + action, {
      method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload), signal: controller.signal,
    });
    if (!response.ok) {
      let code: ErrorKind = "unavailable";
      try {
        const b = await response.json();
        if (b.error === "safety") code = "safety";
        else if (b.error === "timeout") code = "timeout";
        else if (b.error === "invalid_json") code = "invalid_json";
      } catch {
        /* HTTP error without JSON */
      }
      return { data: fallback(), source: "demo", error: code };
    }
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return { data: fallback(), source: "demo", error: "invalid_json" };
    }
    const envelope = z
      .object({ data: schema, source: z.enum(["ai", "demo"]) })
      .safeParse(body);
    if (!envelope.success)
      return { data: fallback(), source: "demo", error: "invalid_json" };
    return envelope.data;
  } catch (error) {
    return {
      data: fallback(),
      source: "demo",
      error:
        error instanceof Error && error.name === "AbortError"
          ? "timeout"
          : "network",
    };
  } finally {
    clearTimeout(timer);
  }
}
export const chatWithCharacter = (
  characterId: string,
  messages: ChatMessage[],
) =>
  requestAI(
    "chat",
    {
      characterId,
      messages: messages.slice(-16).map(({ role, text }) => ({ role, text })),
    },
    z.string().min(1).max(6000),
    () => demoChat(characterId, messages.at(-1)?.text ?? ""),
  );
export const continueStory = (session: StorySession, choice: StoryChoice) =>
  requestAI(
    "continue",
    { session, choice },
    chapterSchema.refine(
      (c) =>
        c.chapter === session.currentChapter + 1 &&
        c.isEnding === (session.currentChapter === 5),
    ),
    () => demoContinue(session, choice),
  );
export const generateStory = (options: StoryOptions) =>
  requestAI("story", options, generatedSchema, () => demoStory(options));
export const generateQuiz = (characterId: string, story?: string) =>
  requestAI("quiz", { characterId, story }, quizSchema, () => quizzes[4]);
export const generateStoryTitle = (summary: string) =>
  requestAI(
    "title",
    { summary: summary.slice(0, 20000) },
    z.string().min(1).max(160),
    () => "Достықтың сиқырлы жолы",
  );
