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

    await expect(page.getByRole("button", { name: "Turn sound off" })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Turn sound off" }).click();
    await expect(page.getByRole("button", { name: "Turn sound on" })).toHaveAttribute("aria-pressed", "false");

    await page.reload();
    await expect(page.getByRole("button", { name: "Turn sound on" })).toHaveAttribute("aria-pressed", "false");

    await page.getByRole("button", { name: "Turn sound on" }).click();
    await expect(page.getByRole("button", { name: "Turn sound off" })).toHaveAttribute("aria-pressed", "true");
  });

  test("intro voice is requested on entry", async ({ page, isMobile }) => {
    test.skip(isMobile, "the entry greeting (and its voice cue) is desktop-only - mobile skips it to avoid popping over an already-tight layout");
    await page.addInitScript(() => {
      const originalPlay = HTMLMediaElement.prototype.play;
      const trackedWindow = window as unknown as Window & { __playedAudio: string[] };
      Object.defineProperty(window, "__playedAudio", {
        value: [] as string[],
        configurable: true,
      });
      HTMLMediaElement.prototype.play = function play() {
        trackedWindow.__playedAudio.push(this.currentSrc || this.src);
        return originalPlay.call(this).catch(() => undefined);
      };
    });

    await page.goto("/");

    await expect
      .poll(
        () =>
          page.evaluate(() =>
            ((window as Window & { __playedAudio?: string[] }).__playedAudio ?? []).some((src) =>
              src.includes("/sounds/yash-intro.mp3")
            )
          ),
        { timeout: 4_000 }
      )
      .toBe(true);
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

  test("desktop resume preview does not show browser-plugin fallback text", async ({ page, isMobile }) => {
    test.skip(isMobile, "mobile intentionally shows the download-first resume fallback");
    await page.goto("/");

    await page.locator(`#${sectionIds.resume}`).scrollIntoViewIfNeeded();
    await expect(page.getByTitle("Yashwanth Medapati resume PDF preview")).toBeVisible();
    await expect(page.getByText(/Preview unavailable in this browser/i)).toHaveCount(0);
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

  test("demo video files are real and reachable", async ({ request }) => {
    const demoProjects = projects.filter((p) => p.demoVideo);
    expect(demoProjects.length).toBeGreaterThan(0);

    for (const project of demoProjects) {
      const response = await request.get(project.demoVideo!);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("video");
    }
  });

  test("a project demo opens an inline player, not a new tab", async ({ page }) => {
    const project = projects.find((p) => p.demoVideo);
    if (!project) test.skip();

    await page.goto("/");
    const button = page.getByRole("button", { name: "Demo" }).first();
    await button.scrollIntoViewIfNeeded();
    await button.click();

    const video = page.locator("video");
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute("src", project!.demoVideo!);

    await page.getByRole("button", { name: "Close demo video" }).click();
    await expect(video).toHaveCount(0);
  });

  test("ML-Focused filter narrows the list", async ({ page }) => {
    await page.goto("/");

    const mlCount = projects.filter((p) => p.mlFocused).length;
    const tab = page.getByRole("tab", { name: /ML-Focused/ });
    await tab.scrollIntoViewIfNeeded();
    await tab.click({ trial: true });
    await tab.click();
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

  test("contact form submits to the API and falls back to an email draft if it errors", async ({ page, context }) => {
    await page.addInitScript(() => {
      const openedUrls: string[] = [];
      Object.defineProperty(window, "__openedUrls", {
        value: openedUrls,
        configurable: true,
      });
      const open = window.open.bind(window);
      window.open = (url?: string | URL, target?: string, features?: string) => {
        if (url) openedUrls.push(String(url));
        return open("about:blank", target, features);
      };
    });
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "not configured" }) });
    });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/");
    await page.locator("#contact-name").fill("Test User");
    await page.locator("#contact-email").fill("test@example.com");
    await page.locator("#contact-message").fill("Hello, this is a test.");

    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("button", { name: "Submit Message" }).click(),
    ]);
    await popup.waitForLoadState("domcontentloaded");
    await expect
      .poll(() =>
        page.evaluate(() =>
          ((window as Window & { __openedUrls?: string[] }).__openedUrls ?? []).some((url) =>
            url.includes("mail.google.com")
          )
        )
      )
      .toBe(true);
    await expect(page.getByText(/Opened your email app instead/i)).toBeVisible();
  });
});
