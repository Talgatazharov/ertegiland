import { z } from "zod";
export const characterIds = [
  "aldar",
  "tostik",
  "tazsha",
  "kendebai",
  "ayaz",
  "zhirenshe",
  "makta",
  "kozhanasyr",
  "kanbak",
] as const;
export type CharacterId = (typeof characterIds)[number];
export interface CharacterProfile {
  id: CharacterId;
  name: string;
  image: string | null;
  imageSlug: string | null;
  imageCredit: string;
  shortDescription: string;
  description: string;
  personality: string[];
  values: string[];
  strengths: string[];
  speakingStyle: string;
  storyStyle: string;
  problemSolvingStyle: string;
  emotionalStyle: string;
  role: string;
  typicalLocations: string[];
  storyThemes: string[];
  taskTypes: string[];
  storyBackground: string;
  greeting: string;
  suggestedQuestions: string[];
  aiSystemPrompt: string;
  color: string;
  accent: string;
  invitation: string;
}
export type Character = CharacterProfile;
export const sourceSchema = z.enum(["ai", "demo"]);
export type Source = z.infer<typeof sourceSchema>;
export const sceneIds = [
  "steppe",
  "forest",
  "mountain",
  "village",
  "garden",
  "sky",
  "court",
] as const;
export const sceneSchema = z.enum(sceneIds);
export type Scene = z.infer<typeof sceneSchema>;
export const choiceSchema = z.object({
  id: z.string().min(1).max(80),
  emoji: z.string().max(16),
  text: z.string().min(1).max(180),
});
export const memorySchema = z.object({
  items: z.array(z.string().max(120)).max(20),
  allies: z.array(z.string().max(120)).max(20),
  discoveries: z.array(z.string().max(250)).max(25),
});
export type StoryMemory = z.infer<typeof memorySchema>;
export const chapterOutputSchema = z.object({
  chapter: z.number().int().min(1).max(6),
  title: z.string().min(1).max(160),
  story: z.string().min(1).max(6000),
  dialogue: z.string().min(1).max(1600),
  atmosphere: z.string().min(1).max(500),
  scene: sceneSchema,
  memory: memorySchema,
  choices: z.array(choiceSchema).max(3),
  isEnding: z.boolean(),
});
export const chapterSchema = chapterOutputSchema
  .extend({ source: sourceSchema.optional() })
  .refine(
    (v) =>
      (v.isEnding ? v.choices.length === 0 : v.choices.length === 3) &&
      new Set(v.choices.map((c) => c.id)).size === v.choices.length &&
      new Set(v.choices.map((c) => c.text)).size === v.choices.length &&
      v.isEnding === (v.chapter === 6),
  );
export type StoryChoice = z.infer<typeof choiceSchema>;
export type StoryChapter = z.infer<typeof chapterSchema>;
export const sessionSchema = z
  .object({
    id: z.string().min(1).max(80),
    characterId: z.enum(characterIds),
    chapters: z.array(chapterSchema).min(1).max(6),
    choices: z.array(choiceSchema).max(5),
    currentChapter: z.number().int().min(1).max(6),
    createdAt: z.string().datetime(),
    source: sourceSchema,
  })
  .refine(
    (s) =>
      s.choices.length === s.chapters.length - 1 &&
      s.currentChapter === s.chapters.length &&
      s.chapters.every((c, i) => c.chapter === i + 1) &&
      s.choices.every((c, i) =>
        s.chapters[i].choices.some((v) => v.id === c.id && v.text === c.text),
      ),
  );
export type StorySession = z.infer<typeof sessionSchema>;
export const bookChapterSchema = z.object({
  title: z.string().min(1).max(160),
  text: z.string().min(1).max(9000),
  dialogue: z.string().max(1600).optional(),
  atmosphere: z.string().max(500).optional(),
  scene: sceneSchema.optional(),
  decision: z.string().max(250).optional(),
  source: sourceSchema.optional(),
});
export const generatedSchema = z.object({
  title: z.string().min(1).max(160),
  chapters: z
    .array(
      z.object({
        title: z.string().min(1).max(160),
        text: z.string().min(1).max(6000),
      }),
    )
    .length(3),
  moral: z.string().min(1).max(1000),
});
export type GeneratedStory = z.infer<typeof generatedSchema>;
export type Story = GeneratedStory;
export const bookSchema = z.object({
  title: z.string().min(1).max(160),
  chapters: z.array(bookChapterSchema).min(1).max(7),
  moral: z.string().min(1).max(1000),
  id: z.string(),
  characterId: z.enum(characterIds),
  createdAt: z.string(),
  source: sourceSchema,
  illustration: z.string().optional(),
  choices: z.array(z.string()),
  titleSource: sourceSchema.optional(),
});
export type SavedBook = z.infer<typeof bookSchema>;
export const quizSchema = z.object({
  question: z.string().min(1).max(700),
  answers: z.array(z.string().min(1).max(300)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1).max(1000),
});
export type QuizQuestion = z.infer<typeof quizSchema>;
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  source?: Source;
}
export interface StoryOptions {
  characterId: CharacterId;
  place: string;
  problem: string;
  mood: string;
}
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
}
export type ErrorKind =
  "network" | "timeout" | "invalid_json" | "unavailable" | "safety";
export interface AIResponse<T> {
  data: T;
  source: Source;
  error?: ErrorKind;
}
