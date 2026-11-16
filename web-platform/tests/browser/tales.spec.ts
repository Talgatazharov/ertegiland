import { test, expect } from "@playwright/test";
import { tales, taleCategories } from "../../src/data/tales";

test("catalog opens all 12 stories and selected genre survives generation and reload", async ({
  page,
  request,
}) => {
  await page.goto("/tales");
  await expect(page.locator(".tale-category")).toHaveCount(3);
  for (const c of taleCategories)
    await expect(
      page.getByRole("heading", { name: c.name, exact: true }),
    ).toBeVisible();
  for (const tale of tales) {
    await page.goto("/tales/" + tale.id);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      tale.title,
    );
    await expect(page.locator(".tale-reader .prose")).toHaveCount(3);
    const response = await request.post("/api/ai/story", {
      data: {
        taleId: tale.id,
        characterId: "aldar",
        place: "Ғарыш",
        problem: "Досын құтқару",
        mood: "Сиқырлы",
      },
    });
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.source).toBe("demo");
    expect(result.data.title).toBe(tale.title);
    expect(result.data.chapters).toEqual(tale.chapters);
  }
  await page.goto("/tales/friendly-chick");
  await page
    .getByRole("link", { name: "Осы тақырыпта ертегі құрастыр" })
    .click();
  await expect(page.getByLabel("Ертегі тақырыбы")).toHaveValue(
    "friendly-chick",
  );
  await expect(page.locator(".character-picker")).toHaveCount(0);
  await page.getByRole("button", { name: "Ертегімді жаса" }).click();
  await expect(page.locator(".book h1")).toHaveText("Достық іздеген балапан");
  await expect(page.locator(".book-cover > p")).toHaveText("балапан");
  await page.reload();
  await expect(page.locator(".book-cover > p")).toHaveText("балапан");
  await page.goto("/library");
  await expect(page.locator(".library-book-copy p")).toHaveText("балапан");
  const bad = await request.post("/api/ai/story", {
    data: {
      taleId: "unknown",
      characterId: "aldar",
      place: "Ғарыш",
      problem: "Досын құтқару",
      mood: "Сиқырлы",
    },
  });
  expect(bad.status()).toBe(400);
});

test("catalog and reader fit phone and desktop screens", async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/tales",
      "/tales/magic-dombra",
      "/create?tale=honest-work",
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        path + " at " + width,
      ).toBe(true);
    }
  }
  await page.goto("/tales");
  await page.screenshot({
    path: "test-results/tales-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/tales-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
});
