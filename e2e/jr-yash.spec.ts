import { test, expect } from "@playwright/test";

// The roaming Yash sprite is used as the trigger throughout since, unlike the
// Nav's "Ask Yash" button, it's always visible regardless of viewport
// (the desktop nav button is hidden below the md breakpoint).
function yashTrigger(page: import("@playwright/test").Page) {
  return page.getByRole("button", { name: "Yash, an AI guide - click to chat" });
}

test.describe("Yash assistant", () => {
  test("opens on click (after the jump), greets, and can be closed with the close button", async ({ page }) => {
    await page.goto("/");

    await yashTrigger(page).click();

    const panel = page.locator("#jr-yash-panel");
    await expect(panel).toBeVisible({ timeout: 3000 });
    await expect(panel.getByText(/Hey, I'm Yash/)).toBeVisible();

    await page.getByRole("button", { name: "Close Yash", exact: true }).click();
    await expect(panel).toBeHidden();
  });

  test("close button closes the panel and returns focus to whatever opened it", async ({ page }) => {
    await page.goto("/");

    const trigger = yashTrigger(page);
    await trigger.click();
    await expect(page.locator("#jr-yash-panel")).toBeVisible({ timeout: 3000 });

    await page.getByRole("button", { name: "Close Yash", exact: true }).click();
    await expect(page.locator("#jr-yash-panel")).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("clicking a suggested prompt answers and scrolls to the relevant section", async ({ page }) => {
    await page.goto("/");

    await yashTrigger(page).click();
    await page.getByRole("button", { name: /Show me my AI projects/ }).click();

    await expect(page.getByText(/start with NutriDent AI/i)).toBeVisible();
    await expect(page.locator("#projects")).toBeInViewport({ timeout: 5000 });
  });

  test("free-text question via the input gets a response", async ({ page }) => {
    await page.goto("/");

    await yashTrigger(page).click();
    const input = page.getByPlaceholder("follow me | ask-yash --about projects");
    await input.fill("What tech stack does he use?");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText(/day-to-day stack is pretty practical/i)).toBeVisible();
  });

  test("follow me command switches on cursor-follow behavior", async ({ page }) => {
    await page.goto("/");

    await yashTrigger(page).click();
    const input = page.getByPlaceholder("follow me | ask-yash --about projects");
    await input.fill("follow me");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText(/Follow mode is on/i)).toBeVisible();
  });

  test("closed panel does not linger and block clicks underneath it", async ({ page }) => {
    // Regression test: framer-motion's AnimatePresence can leave the exited
    // panel in the DOM at opacity:0 indefinitely. Without pointerEvents:none
    // baked into the exit animation, that invisible node keeps intercepting
    // clicks in its old screen position - silently blocking whatever's under
    // it (the roaming Yash sprite, page content, etc).
    await page.goto("/");

    await yashTrigger(page).click();
    const panel = page.locator("#jr-yash-panel");
    await expect(panel).toBeVisible({ timeout: 3000 });

    await page.getByRole("button", { name: "Close Yash", exact: true }).click();

    const blocksClicks = await panel.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return el.contains(hit);
    });
    expect(blocksClicks).toBe(false);
  });
});
