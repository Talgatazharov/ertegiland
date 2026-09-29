import { test, expect } from "@playwright/test";
test("personal key is sent per request, cleared and never persisted", async ({page}) => {
  const key = "sk-test-only-1234567890";
  const headers: (string | undefined)[] = [];
  await page.route("**/api/ai/chat", async route => {
    headers.push(route.request().headers()["x-openai-key"]);
    await route.fulfill({json: {data: "Тест жауабы", source: "ai"}});
  });
  await page.goto("/chat/aldar");
  await page.locator(".api-key-settings summary").click();
  await page.locator("#personal-api-key").fill(key);
  await page.getByRole("button", {name:"Қолдану", exact:true}).click();
  await expect(page.locator("#personal-api-key")).toHaveValue("");
  const ask = () => page.getByRole("button", {name:"Сен қиындықтан қалай шығасың?", exact:true}).click();
  await ask();
  await expect.poll(() => headers.length).toBe(1);
  expect(headers[0]).toBe(key);
  expect(await page.evaluate(() => JSON.stringify([localStorage, sessionStorage]))).not.toContain(key);
  await page.getByRole("button", {name:"Кілтті өшіру", exact:true}).click();
  await ask();
  await expect.poll(() => headers.length).toBe(2);
  expect(headers[1]).toBeUndefined();
  await page.locator("#personal-api-key").fill(key);
  await page.getByRole("button", {name:"Қолдану", exact:true}).click();
  await page.reload();
  await ask();
  await expect.poll(() => headers.length).toBe(3);
  expect(headers[2]).toBeUndefined();
});
