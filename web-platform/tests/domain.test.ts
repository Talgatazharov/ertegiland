import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { z } from "zod";
import {
  chapterSchema,
  generatedSchema,
  quizSchema,
  sessionSchema,
  bookSchema,
} from "../src/types";
import { characters, places, problems, moods } from "../src/data/characters";
import { quizzes } from "../src/data/quizzes";
import { demoContinue, demoStory, demoChat } from "../src/services/demoService";
import {
  createSession,
  appendChapter,
  sessionToBook,
} from "../src/services/storyEngine";
import { migrateSession } from "../src/services/storageService";
import { requestAI } from "../src/services/aiService";
import { characterPrompt, continuationPrompt } from "../server/prompts";
test("all 2187 demo paths end at six chapters, retain memory and create readable books", () => {
  for (const c of characters)
    for (let route = 0; route < 243; route++) {
      let s = createSession(c.id);
      let encoded = route;
      for (let step = 2; step <= 6; step++) {
        const index = encoded % 3;
        encoded = Math.floor(encoded / 3);
        const choice = s.chapters.at(-1)!.choices[index];
        const previous = s.chapters.at(-1)!.memory;
        const next = demoContinue(s, choice);
        chapterSchema.parse(next);
        assert.ok(next.story.includes(choice.text));
        for (const item of previous.items)
          assert.ok(next.memory.items.includes(item));
        for (const ally of previous.allies)
          assert.ok(next.memory.allies.includes(ally));
        s = appendChapter(s, choice, next, "demo");
      }
      sessionSchema.parse(s);
      assert.equal(s.currentChapter, 6);
      assert.equal(s.choices.length, 5);
      assert.equal(s.chapters[5].choices.length, 0);
      const book = bookSchema.parse(sessionToBook(s));
      assert.equal(book.chapters.length, 6);
      assert.ok(book.chapters[0].decision);
      assert.ok(book.chapters[5].dialogue);
    }
});
test("each option changes the narrative beyond echoing the chosen label at every stage", () => {
  for (const c of characters) {
    let s = createSession(c.id);
    for (let step = 2; step <= 6; step++) {
      const choices = s.chapters.at(-1)!.choices;
      const variants = choices.map((choice) => demoContinue(s, choice));
      assert.equal(
        new Set(variants.map((v) => v.story.split(". ").slice(1).join(". ")))
          .size,
        3,
      );
      if (step < 6)
        assert.equal(
          new Set(variants.map((v) => JSON.stringify(v.memory))).size,
          3,
        );
      s = appendChapter(s, choices[0], variants[0], "demo");
    }
  }
});
test("all profiles, greetings, chat voices, openings and prompts are distinct", () => {
  assert.equal(characters.length, 9);
  for (const getter of [
    (c: (typeof characters)[number]) => c.aiSystemPrompt,
    (c: (typeof characters)[number]) =>
      demoChat(c.id, "Сен қиындықтан қалай шығасың?"),
    (c: (typeof characters)[number]) => createSession(c.id).chapters[0].story,
    (c: (typeof characters)[number]) =>
      demoStory({
        characterId: c.id,
        place: places[0],
        problem: problems[0],
        mood: moods[0],
      }).chapters[1].text,
  ])
    assert.equal(new Set(characters.map(getter)).size, 9);
  for (const c of characters) {
    const prompt = characterPrompt(c.id, "CHAT");
    assert.ok(prompt.includes(c.aiSystemPrompt));
    assert.ok(prompt.includes("4-сынып"));
    assert.ok(prompt.includes(c.problemSolvingStyle));
    assert.ok(continuationPrompt(createSession(c.id)).includes("2/6"));
  }
});
test("eight supplied images exist in two optimized sizes without inventing Kende bai image", async () => {
  const manifest = JSON.parse(
    await readFile("assets/characters-manifest.json", "utf8"),
  );
  assert.equal(manifest.length, 8);
  for (const c of characters) {
    if (c.id === "kendebai") {
      assert.equal(c.image, null);
      continue;
    }
    assert.ok(c.image);
    for (const size of [480, 960]) {
      const file = await stat(
        "public/characters/" + c.imageSlug + "-" + size + ".webp",
      );
      assert.ok(file.size > 10000);
      assert.ok(file.size < 400000);
    }
  }
});
test("legacy sessions and books remain readable; malformed transitions are rejected", () => {
  const current = createSession("aldar");
  const first = current.chapters[0];
  const legacy = {
    id: "old",
    characterId: "aldar",
    chapters: [
      { story: "Бұрынғы оқиға", choices: first.choices, isEnding: false },
    ],
    choices: [],
    source: "demo",
  };
  const restored = migrateSession(legacy);
  assert.ok(restored);
  assert.equal(restored.chapters[0].story, "Бұрынғы оқиға");
  assert.equal(restored.currentChapter, 1);
  const next = demoContinue(restored, restored.chapters[0].choices[0]);
  sessionSchema.parse(appendChapter(restored, first.choices[0], next, "demo"));
  bookSchema.parse({
    id: "legacy-book",
    characterId: "aldar",
    title: "Бұрынғы кітап",
    chapters: [{ title: "1-бөлім", text: "Сақталған мәтін" }],
    moral: "Достық",
    createdAt: "2026-01-01",
    source: "demo",
    choices: [],
  });
  assert.equal(migrateSession({ id: 3 }), null);
  assert.throws(() =>
    appendChapter(
      current,
      { id: "forged", emoji: "", text: "fake" },
      next,
      "demo",
    ),
  );
  assert.equal(
    chapterSchema.safeParse({ ...first, chapter: 6 }).success,
    false,
  );
  assert.equal(
    chapterSchema.safeParse({
      ...first,
      choices: [first.choices[0], first.choices[0], first.choices[0]],
    }).success,
    false,
  );
});
test("generator incorporates all selected parameters and structured validation rejects bad AI data", () => {
  const options = {
    characterId: "tazsha" as const,
    place: places[2],
    problem: problems[4],
    mood: moods[3],
  };
  const generated = demoStory(options);
  generatedSchema.parse(generated);
  const text = JSON.stringify(generated).toLocaleLowerCase("kk");
  for (const value of [options.place, options.mood, options.problem])
    assert.ok(text.includes(value.toLocaleLowerCase("kk")));
  assert.equal(quizzes.length, 10);
  quizzes.forEach((q) => quizSchema.parse(q));
  assert.equal(
    quizSchema.safeParse({ ...quizzes[0], correctIndex: 9 }).success,
    false,
  );
  assert.equal(
    generatedSchema.safeParse({ title: "x", chapters: [], moral: "x" }).success,
    false,
  );
});
test("API transport handles network, validation and successful envelopes", async () => {
 const original=globalThis.fetch;
 try {
  globalThis.fetch=async()=>{throw new Error("offline");};
  assert.equal((await requestAI("chat", {}, z.string(),()=>"fallback")).error,"network");
  globalThis.fetch=async()=>Response.json({error:"invalid_json"},{status:400});
  assert.equal((await requestAI("chat", {}, z.string(),()=>"fallback")).error,"invalid_json");
  globalThis.fetch=async()=>Response.json({data:"answer",source:"ai"});
  assert.equal((await requestAI("chat", {}, z.string(),()=>"fallback")).data,"answer");
 } finally { globalThis.fetch=original; }
});
