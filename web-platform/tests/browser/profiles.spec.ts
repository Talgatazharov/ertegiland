import { test, expect } from "@playwright/test";
const ids = [
  "aldar",
  "tostik",
  "tazsha",
  "kendebai",
  "ayaz",
  "zhirenshe",
  "makta",
  "kozhanasyr",
  "kanbak",
];
test("all nine profiles have working detail chat and story routes with distinct live demo replies", async ({
  page,
  request,
}) => {
  expect((await (await request.get("/api/health")).json()).version).toBe("2.0");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const replies = new Set<string>();
  const chapters = new Set<string>();
  for (const id of ids) {
    await page.goto("/characters/" + id);
    await expect(page.locator(".cinematic-detail h1")).toBeVisible();
    const img = page.locator(".detail-portrait img");
    if (id !== "kendebai") {
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(0);
    } else
      await expect(page.locator(".detail-image-caption")).toContainText(
        "Архивте суреті жоқ",
      );
    await page
      .getByRole("link", { name: "Кейіпкермен сөйлесу", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Сен қиындықтан қалай шығасың?",
        exact: true,
      })
      .click();
    await expect(page.locator(".message.assistant")).toHaveCount(2);
    replies.add(await page.locator(".message.assistant p").last().innerText());
    await expect(
      page.locator(".message.assistant .badge").last(),
    ).toContainText("Дайын демо жауап");
    await page.goto("/story/" + id);
    await expect(page.locator(".story-meta")).toContainText("1 / 6");
    const response = page.waitForResponse("**/api/ai/continue");
    await page.locator(".choice-grid button").first().click();
    expect((await response).status()).toBe(200);
    await expect(page.locator(".story-meta")).toContainText("2 / 6");
    await expect(page.locator(".memory-panel ul li")).toHaveCount(1);
    chapters.add(await page.locator(".story-text").innerText());
    await page.reload();
    await expect(page.locator(".story-meta")).toContainText("2 / 6");
  }
  expect(replies.size).toBe(9);
  expect(chapters.size).toBe(9);
  expect(errors).toEqual([]);
});
test("legacy browser data survives an upgrade and book export retains choices and dialogue", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "ertegiland.v1.books",
      JSON.stringify([
        {
          id: "old-book",
          characterId: "aldar",
          title: "Сақталған ескі кітап",
          chapters: [
            { title: "Бұрынғы бөлім", text: "Бұл мәтін өзгермеуі керек." },
          ],
          moral: "Достық",
          createdAt: "2026-01-01",
          source: "demo",
          choices: [],
        },
      ]),
    );
    localStorage.setItem(
      "ertegiland.v1.session",
      JSON.stringify({
        id: "old-session",
        characterId: "tostik",
        chapters: [
          {
            story: "Ескі сапардың бастауы.",
            choices: [
              { id: "forest", emoji: "🌲", text: "Орманға бару" },
              { id: "mountain", emoji: "🏔️", text: "Тауды көру" },
              { id: "village", emoji: "🏘️", text: "Ауылға бару" },
            ],
            isEnding: false,
          },
        ],
        choices: [],
        source: "demo",
      }),
    );
  });
  await page.goto("/book/old-book");
  await expect(page.locator(".book")).toContainText(
    "Бұл мәтін өзгермеуі керек.",
  );
  await page.goto("/story");
  await expect(page.locator(".story-text")).toContainText(
    "Ескі сапардың бастауы.",
  );
  for (let i = 2; i <= 6; i++) {
    await page.locator(".choice-grid button").first().click();
    await expect(page.locator(".story-meta")).toContainText(i + " / 6");
  }
  await page
    .getByRole("button", { name: "Кітапханаға сақтау", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Кітапханаға сақталды", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Ертегімді оқу", exact: true })
    .click();
  await expect(page.locator(".book-chapter")).toHaveCount(6);
  await expect(page.locator(".chapter-choice")).toHaveCount(5);
  await expect(page.locator(".book-chapter .scene-art")).toHaveCount(6);
  await expect(page.locator(".book-chapter .story-dialogue")).toHaveCount(6);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".chapter-choice").first()).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await page.goto("/library");
  await expect(page.locator(".library-book")).toHaveCount(2);
});
