import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCharacter, places, problems, moods } from "../src/data/characters";
import { quizzes } from "../src/data/quizzes";
import {
  characterIds,
  choiceSchema,
  chapterSchema,
  chapterOutputSchema,
  generatedSchema,
  quizSchema,
  sessionSchema,
} from "../src/types";
import { demoChat, demoContinue, demoStory } from "../src/services/demoService";
import {
  characterPrompt,
  continuationPrompt,
  safetyPrompt,
  storyQuality,
} from "./prompts";
const app = express();
app.disable("x-powered-by");
if (process.env.RENDER === "true") app.set("trust proxy", 1);
app.get("/healthz", (_req, res) => res.json({status: "ok"}));
app.use("/api", (_req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); });
app.use(express.json({ limit: "160kb" }));
const serverClient = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 45000,
      maxRetries: 0,
    })
  : null;
const buckets = new Map<string, { count: number; until: number }>();
app.use("/api", (req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) {
        res.status(403).json({ error: "unavailable" });
        return;
      }
    } catch {
      res.status(403).json({ error: "unavailable" });
      return;
    }
  }
  const now = Date.now();
  for (const [k, v] of buckets) if (v.until < now) buckets.delete(k);
  const key = req.ip ?? "local";
  const bucket = buckets.get(key) ?? { count: 0, until: now + 60000 };
  bucket.count++;
  buckets.set(key, bucket);
  if (bucket.count > 40) {
    res.status(429).json({ error: "unavailable" });
    return;
  }
  next();
});
app.get("/api/health", (_req, res) =>
  res.json({ mode: serverClient ? "ai" : "demo", version: "2.0" }),
);
const id = z.enum(characterIds);
const chatInput = z.object({
  characterId: id,
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().min(1).max(3000),
      }),
    )
    .min(1)
    .max(16),
});
const continueInput = z
  .object({
    session: sessionSchema.refine((s) => s.currentChapter < 6),
    choice: choiceSchema,
  })
  .refine((v) =>
    v.session.chapters
      .at(-1)
      ?.choices.some((c) => c.id === v.choice.id && c.text === v.choice.text),
  );
const storyInput = z.object({
  characterId: id,
  place: z.enum(places as [string, ...string[]]),
  problem: z.enum(problems as [string, ...string[]]),
  mood: z.enum(moods as [string, ...string[]]),
});
const quizInput = z.object({
  characterId: id,
  story: z.string().max(20000).optional(),
});
const titleInput = z.object({ summary: z.string().min(1).max(20000) });
const imageInput = z.object({ prompt: z.string().min(1).max(2500) });
async function moderate(client: OpenAI | null, text: string) {
  if (!client) return;
  const r = await client.moderations.create({
    model: "omni-moderation-latest",
    input: text,
  });
  if (r.results.some((v) => v.flagged)) throw new Error("safety");
}
async function structured<T>(
  client: OpenAI | null,
  schema: z.ZodType<T>,
  instructions: string,
  payload: unknown,
): Promise<T> {
  if (!client) throw new Error("unavailable");
  await moderate(client, JSON.stringify(payload));
  const result = await client.responses.parse({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    store: false,
    instructions,
    input: JSON.stringify(payload),
    text: { format: zodTextFormat(schema, "result") },
    max_output_tokens: 4500,
  });
  if (!result.output_parsed) throw new Error("invalid_json");
  const parsed = schema.parse(result.output_parsed);
  await moderate(client, JSON.stringify(parsed));
  return parsed;
}
app.post("/api/ai/:action", async (req, res) => {
  try {
    const client = serverClient;
    const action = req.params.action;
    let data: unknown;
    if (action === "chat") {
      const p = chatInput.parse(req.body);
      data = client
        ? (
            await structured(client, 
              z.object({ answer: z.string().min(1).max(6000) }),
              characterPrompt(
                p.characterId,
                "Осы кейіпкер атынан 2–5 табиғи сөйлеммен жауап бер. Мәселені шешу тәсілін жеке мінезімен көрсет. Жауап соңында бір ойландыратын сұрақ қоюға болады.",
              ),
              p,
            )
          ).answer
        : demoChat(p.characterId, p.messages.at(-1)?.text ?? "");
    } else if (action === "continue") {
      const p = continueInput.parse(req.body);
      const currentChapter = p.session.currentChapter + 1;
      if (!client) data = demoContinue(p.session, p.choice);
      else {
        const raw = await structured(client, 
          chapterOutputSchema,
          continuationPrompt(p.session),
          {
            characterId: p.session.characterId,
            storyHistory: p.session.chapters,
            previousChoices: p.session.choices,
            selectedChoice: p.choice,
            currentChapter,
            memory: p.session.chapters.at(-1)?.memory,
          },
        );
        data = chapterSchema
          .refine((c) => c.chapter === currentChapter)
          .parse(raw);
      }
    } else if (action === "story") {
      const p = storyInput.parse(req.body);
      data = client
        ? await structured(client, 
            generatedSchema,
            characterPrompt(
              p.characterId,
              storyQuality +
                " Үш бөлімнен тұратын тұтас ертегі жаса: кіріспе, шиеленіс пен шешім. Әр бөлімде табиғи диалог болсын. Мекен, мәселе және көңіл күйі нақты көрінсін. Соңында ой түйетін қорытынды бер.",
            ),
            p,
          )
        : demoStory(p);
    } else if (action === "quiz") {
      const p = quizInput.parse(req.body);
      data = client
        ? await structured(client, 
            quizSchema,
            characterPrompt(
              p.characterId,
              "Берілген оқиға не әдеби сипаттама бойынша бір сұрақ, дәл 4 әртүрлі жауап және correctIndex (0–3) жаса. Бір ғана дұрыс жауап болсын. Жаңа ойдан шығарылған деректі халық ертегісіне теліме.",
            ),
            { ...p, description: getCharacter(p.characterId).description },
          )
        : quizzes[4];
    } else if (action === "title") {
      const p = titleInput.parse(req.body);
      data = client
        ? (
            await structured(client, 
              z.object({ title: z.string().min(1).max(160) }),
              safetyPrompt +
                " Оқиға мазмұнына сай қысқа көркем қазақша атау бер.",
              p,
            )
          ).title
        : "Достықтың сиқырлы жолы";
    } else if (action === "image") {
      const p = imageInput.parse(req.body);
      if (!client || process.env.ENABLE_IMAGE_GENERATION !== "true") {
        res.json({ data: "/storybook.svg", source: "demo" });
        return;
      }
      await moderate(client, p.prompt);
      const result = await client.images.generate(
        {
          model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
          prompt: safetyPrompt + " " + p.prompt,
          size: "1024x1024",
          quality: "low",
        },
        { timeout: 120000 },
      );
      const b64 = result.data?.[0]?.b64_json;
      if (!b64) throw new Error("invalid_json");
      data = "data:image/png;base64," + b64;
    } else {
      res.status(404).json({ error: "unavailable" });
      return;
    }
    res.json({ data, source: client ? "ai" : "demo" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "invalid_json" });
      return;
    }
    const name = error instanceof Error ? error.name : "";
    const message = error instanceof Error ? error.message : "";
    const code =
      message === "safety"
        ? "safety"
        : /Timeout|Abort/.test(name)
          ? "timeout"
          : message === "invalid_json"
            ? "invalid_json"
            : "unavailable";
    res.status(code === "safety" ? 422 : 502).json({ error: code });
  }
});
app.use("/api", (_req, res) => res.status(404).json({ error: "unavailable" }));
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
app.use(express.static(root));
app.get("/{*path}", (_req, res) => res.sendFile(path.join(root, "index.html")));
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    res
      .status(error instanceof SyntaxError ? 400 : 500)
      .json({ error: "invalid_json" });
  },
);
app.listen(Number(process.env.PORT) || 3001, process.env.HOST || "0.0.0.0", () =>
  console.log(
    "ErtegiLand v2: http://127.0.0.1:" +
      (process.env.PORT || 3001) +
      " (" +
      (serverClient ? "AI" : "demo") +
      ")",
  ),
);
