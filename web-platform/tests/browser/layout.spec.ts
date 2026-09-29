import { test, expect } from "@playwright/test";
test("desktop tablet and mobile visual review with all supplied artwork loaded", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  for (const picture of await page.locator(".character-showcase img").all()) {
    await picture.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        picture.evaluate((img) => (img as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.screenshot({
    path: "test-results/hero-desktop.png",
    animations: "disabled",
  });
  for (const [name, width, height] of [
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.screenshot({
      path: "test-results/hero-" + name + ".png",
      animations: "disabled",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    const columns = await page
      .locator(".character-grid")
      .first()
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
    expect(columns).toBe(name === "tablet" ? 2 : 1);
  }
  await page.goto("/characters/ayaz");
  await page.screenshot({
    path: "test-results/detail-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/story/tostik");
  await page.screenshot({
    path: "test-results/story-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({
    path: "test-results/story-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/library");
  await page.evaluate(() =>
    localStorage.setItem("ertegiland.v1.books", "broken"),
  );
  await page.reload();
  await expect(page.locator(".empty")).toBeVisible();
  await expect(page.locator(".storage-notice")).toBeVisible();
  expect(errors).toEqual([]);
});
