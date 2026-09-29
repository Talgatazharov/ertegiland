import { test, expect } from "@playwright/test";
test("home, character, chat, six-step story, saved book and deletion", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "ЖИ әлемінде",
  );
  await page
    .getByRole("link", { name: "Ертегі әлеміне кіру", exact: true })
    .click();
  await page
    .getByRole("link", { name: /Алдар Көсе: кейіпкерді таңдау/ })
    .click();
  await page.getByRole("link", { name: /Кейіпкермен сөйлесу/ }).click();
  await page
    .getByRole("button", { name: "Әділеттілік деген не?", exact: true })
    .click();
  await expect(page.locator(".message.assistant").last()).toContainText(
    "Әділдік",
  );
  await page.getByRole("link", { name: /Енді бірге оқиғаға/ }).click();
  await page.locator(".choice-list button").nth(1).click();
  await expect(page.locator(".story-meta")).toContainText("2 / 6");
  await page.reload();
  await expect(page.locator(".story-meta")).toContainText("2 / 6");
  for (let step = 3; step <= 6; step++) {
    await page.locator(".choice-list button").first().click();
    await expect(page.locator(".story-meta")).toContainText(step + " / 6");
  }
  await expect(page.locator(".ending")).toContainText("Жарайсың");
  await page.getByRole("button", { name: "Ертегімді оқу" }).click();
  await expect(page.locator(".book-chapter")).toHaveCount(6);
  await page.reload();
  await expect(page.locator(".book-chapter")).toHaveCount(6);
  await page.getByRole("link", { name: "← Менің кітапханам" }).click();
  await expect(page.locator(".library-book")).toHaveCount(1);
  await expect(page.locator(".achievement.earned")).toHaveCount(3);
  await page.getByRole("button", { name: /кітабын өшіру/ }).click();
  await page.getByRole("button", { name: "Иә, өшіру", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Алғашқы кітабыңа орын дайын" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("generator, illustration fallback, title, print and AI quiz", async ({
  page,
}) => {
  await page.goto("/create");
  await page.getByText("Ғарыш", { exact: true }).click();
  await page.getByText("Табиғатты қорғау", { exact: true }).click();
  await page
    .getByRole("button", { name: "Ертегімді жаса", exact: true })
    .click();
  await expect(page.locator(".book")).toContainText("Ғарыш");
  await expect(page.locator(".book")).toContainText("табиғатты қорғау");
  await expect(page.locator(".book-chapter")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Иллюстрация жасау", exact: true })
    .click();
  await expect(page.getByText(/Дайын иллюстрация көрсетілді/)).toBeVisible();
  await page
    .getByRole("button", { name: "Жаңа атау ұсыну", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Достықтың сиқырлы жолы",
  );
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".book")).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await page.goto("/quiz");
  await page
    .getByRole("button", { name: "ЖИ сұрақ қойсын", exact: true })
    .click();
  await expect(page.locator(".quiz-card")).toContainText(
    "ЖИ құрастырған жаңа ертегі",
  );
  await page.locator(".quiz-answers button").nth(2).click();
  await expect(page.locator(".quiz-feedback")).toContainText("Дұрыс!");
});
test("quiz wrong retry, 10 answers and persistent achievement", async ({
  page,
}) => {
  await page.goto("/quiz");
  await page.locator(".quiz-answers button").nth(0).click();
  await expect(page.locator(".quiz-feedback")).toContainText(
    "Тағы ойланып көр",
  );
  const correct = [1, 2, 3, 0, 2, 1, 2, 3, 0, 1];
  for (let i = 0; i < 10; i++) {
    await page.locator(".quiz-answers button").nth(correct[i]).click();
    await expect(page.locator(".quiz-feedback")).toContainText("Дұрыс!");
    await page
      .getByRole("button", { name: i === 9 ? "Нәтижені көру" : "Келесі сұрақ" })
      .click();
  }
  await expect(page.locator(".quiz-card")).toContainText("10 сұрақтың 10");
  await page.goto("/library");
  await expect(page.locator(".achievement.earned")).toContainText("Білгір");
  await page.reload();
  await expect(page.locator(".achievement.earned")).toContainText("Білгір");
});
test("malformed JSON and offline network preserve usable story", async ({
  page,
}) => {
  await page.route("**/api/ai/continue", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "bad-json",
    }),
  );
  await page.goto("/story/tostik");
  await page.locator(".choice-list button").first().click();
  await expect(page.locator('[role="alert"]')).toContainText(
    "Жаңа парақ дұрыс ашылмады",
  );
  await expect(page.locator(".story-meta")).toContainText("2 / 6");
  await page.unroute("**/api/ai/continue");
  await page.getByRole("button", { name: "Қайта көру", exact: true }).click();
  await expect(page.locator(".story-meta")).toContainText("2 / 6");
  await expect(page.locator(".journey-panel ol > li")).toHaveCount(2);
  await page.route("**/api/ai/continue", (route) => route.abort());
  await page.locator(".choice-list button").first().click();
  await expect(page.locator('[role="alert"]')).toContainText("Байланыс үзілді");
  await expect(page.locator(".story-meta")).toContainText("3 / 6");
});
test("corrupt storage recovers and mobile has no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("ertegiland.v1.books", "broken");
    localStorage.setItem("ertegiland.v1.session", '{"id":3}');
  });
  for (const route of [
    "/",
    "/characters",
    "/characters/tostik",
    "/create",
    "/story",
    "/quiz",
    "/library",
    "/about",
  ]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow, route).toBe(false);
  }
  await page.getByRole("button", { name: "Мәзірді ашу", exact: true }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Басты бет", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "ЖИ әлемінде",
  );
});
test("API rejects invalid input and cross-origin requests", async ({
  request,
}) => {
  let r = await request.post("/api/ai/story", {
    data: { characterId: "missing" },
  });
  expect(r.status()).toBe(400);
  r = await request.post("/api/ai/chat", {
    headers: { Origin: "https://untrusted.example" },
    data: { characterId: "aldar", messages: [{ role: "user", text: "Сәлем" }] },
  });
  expect(r.status()).toBe(403);
});
