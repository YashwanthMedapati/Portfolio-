import { expect, test } from "@playwright/test";
import { sectionIds } from "../src/data/resume";
import { sectionIntros } from "../src/lib/sectionIntros";

test.describe("Yash section bubbles", () => {
  test("section intro bubble stays inside the viewport", async ({ page }) => {
    await page.goto("/");

    const dismissGreeting = page.getByRole("button", { name: "Dismiss greeting" });
    await expect(dismissGreeting).toBeVisible({ timeout: 4000 });
    await dismissGreeting.click();

    await page.locator(`#${sectionIds.projects}`).scrollIntoViewIfNeeded();
    const intro = page.getByText(sectionIntros[sectionIds.projects]);
    await expect(intro).toBeVisible({ timeout: 5000 });

    const box = await intro.boundingBox();
    const viewport = page.viewportSize();
    expect(box).toBeTruthy();
    expect(viewport).toBeTruthy();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);

    const triggerBox = await page
      .getByRole("button", { name: "Yash, an AI guide - click to chat" })
      .boundingBox();
    expect(triggerBox).toBeTruthy();
    const gapToYash = triggerBox!.y - (box!.y + box!.height);
    expect(gapToYash).toBeGreaterThanOrEqual(0);
    expect(gapToYash).toBeLessThanOrEqual(24);
  });
});
