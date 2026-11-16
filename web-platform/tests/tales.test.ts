import { test } from "node:test";
import assert from "node:assert/strict";
import { tales, taleCategories } from "../src/data/tales";
import { demoStory } from "../src/services/demoService";
import { selectedTalePrompt } from "../src/services/talePrompt";
import { generatedSchema } from "../src/types";

test("all three genres have four complete original tales and genre-specific generation", () => {
  assert.equal(taleCategories.length, 3);
  assert.equal(tales.length, 12);
  assert.equal(new Set(tales.map((t) => t.id)).size, 12);
  assert.equal(new Set(tales.map((t) => t.title)).size, 12);
  for (const category of taleCategories) {
    assert.equal(tales.filter((t) => t.categoryId === category.id).length, 4);
  }
  for (const tale of tales) {
    const story = generatedSchema.parse(
      demoStory({
        taleId: tale.id,
        characterId: "aldar",
        place: "Ғарыш",
        problem: "Досын құтқару",
        mood: "Сиқырлы",
      }),
    );
    assert.equal(story.title, tale.title);
    assert.deepEqual(story.chapters, tale.chapters);
    assert.ok(story.chapters.every((ch) => ch.text.length > 180));
    assert.ok(
      !JSON.stringify(story).includes("Дәурен") || tale.hero === "Дәурен",
    );
    const prompt = selectedTalePrompt(tale.id);
    assert.ok(prompt.includes(tale.title));
    assert.ok(prompt.includes(tale.hero));
    if (tale.categoryId === "everyday")
      assert.ok(
        prompt.includes(
          "Сиқыр, сөйлейтін жануарлар мен ғажайып күштерді қоспа",
        ),
      );
    if (tale.categoryId === "animals")
      assert.ok(prompt.includes("Басты кейіпкерлер жануарлар болсын"));
  }
});
