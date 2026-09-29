import { test, expect } from "@playwright/test";
test("browser calls OpenAI through the existing Vite proxy", async ({page}) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.route("**/src/config/openai.ts*", route => route.fulfill({contentType:"application/javascript", body:'export const OPENAI_API_KEY="sk-test-only-1234567890"; export const OPENAI_MODEL="gpt-4.1-mini"; export const OPENAI_IMAGE_MODEL="gpt-image-1"; export const ENABLE_IMAGE_GENERATION=true;'}));
  let calls=0;
  await page.route("**/openai/**", async route => {
    expect(route.request().headers().authorization).toBe("Bearer sk-test-only-1234567890");
    if(route.request().url().endsWith("/moderations")) {
      await route.fulfill({json:{results:[{flagged:false}]}}); return;
    }
    expect(route.request().url()).toContain("/responses");
    calls++;
    await route.fulfill({json:{id:"resp_test",object:"response",status:"completed",output:[{type:"message",id:"msg_test",role:"assistant",status:"completed",content:[{type:"output_text",text:JSON.stringify({answer:"Тікелей ЖИ тест жауабы"}),annotations:[]}]}]}});
  });
  await page.goto("/chat/aldar");
  await expect(page.locator(".api-key-settings")).toHaveCount(0);
  await page.getByRole("button",{name:"Сен қиындықтан қалай шығасың?",exact:true}).click();
  await expect(page.locator(".message.assistant").last()).toContainText("Тікелей ЖИ тест жауабы");
  expect(calls).toBe(1);
  expect(errors).toEqual([]);
});
test("six chapter story works without a backend", async ({page}) => {
  const apiCalls: string[]=[];
  page.on("request", r => {if(r.url().includes("/api/")) apiCalls.push(r.url());});
  await page.route("**/src/config/openai.ts*", route => route.fulfill({contentType:"application/javascript", body:'export const OPENAI_API_KEY=""; export const OPENAI_MODEL="gpt-4.1-mini"; export const OPENAI_IMAGE_MODEL="gpt-image-1"; export const ENABLE_IMAGE_GENERATION=true;'}));
  await page.goto("/story/aldar");
  for(let chapter=1;chapter<6;chapter++) {
    await expect(page.locator(".story-meta")).toContainText(`${chapter} / 6`);
    await page.locator(".choice-grid button").first().click();
  }
  await expect(page.locator(".story-meta")).toContainText("6 / 6");
  await expect(page.locator(".ending")).toBeVisible();
  expect(apiCalls).toEqual([]);
});
