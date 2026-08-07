import { test, expect } from "@playwright/test";
import { sectionIds, projects } from "../src/data/resume";
import { contactMethods } from "../src/lib/contactMethods";

test.describe("Navigation", () => {
  test("nav links scroll to their sections", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop nav links are hidden on small viewports; see the drawer test below");
    await page.goto("/");

    for (const [id, label] of [
      [sectionIds.projects, "Projects"],
      [sectionIds.skills, "Skills"],
      [sectionIds.contact, "Contact"],
    ] as const) {
      await page.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: label, exact: true }).click();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test("mobile nav drawer opens and navigates", async ({ page, isMobile }) => {
    test.skip(!isMobile, "drawer only rendered on small viewports");
    await page.goto("/");

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    await expect(page.locator(`#${sectionIds.contact}`)).toBeInViewport();
  });

  test("sound toggle switches state", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Turn sound on" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();
    await expect(page.getByRole("button", { name: "Turn sound off" })).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("Resume", () => {
  test("download link points to a real, reachable PDF", async ({ page, request }) => {
    await page.goto("/");
    // Rendered as an <a href download> via Base UI's Button `render` prop, which
    // reports role="button" (not "link") to preserve button semantics - see button.tsx.
    const link = page.getByRole("button", { name: /download pdf/i });
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();

    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("pdf");
  });
});

test.describe("Projects", () => {
  test("each project's Code link matches its data source", async ({ page }) => {
    await page.goto("/");

    const codeLinks = page.getByRole("button", { name: "Code" });
    await expect(codeLinks).toHaveCount(projects.length);

    for (let i = 0; i < projects.length; i++) {
      await expect(codeLinks.nth(i)).toHaveAttribute("href", projects[i].github);
    }
  });

  test("project demo videos point to reachable media", async ({ page, request }) => {
    await page.goto("/");

    for (const project of projects.filter((p) => p.demoVideo)) {
      const demo = page.getByRole("button", { name: "Demo" });
      await expect(demo).toHaveAttribute("href", project.demoVideo!);

      const response = await request.get(project.demoVideo!);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("video");
    }
  });

  test("ML-Focused filter narrows the list", async ({ page }) => {
    await page.goto("/");

    const mlCount = projects.filter((p) => p.mlFocused).length;
    await page.getByRole("tab", { name: /ML-Focused/ }).click();
    await expect(page.getByRole("button", { name: "Code" })).toHaveCount(mlCount);
  });
});

test.describe("Contact", () => {
  test("contact links match their data source", async ({ page }) => {
    await page.goto("/");

    for (const method of contactMethods) {
      await expect(page.getByRole("link", { name: method.label })).toHaveAttribute("href", method.href);
    }
  });
});
