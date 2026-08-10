import { expect, test } from "@playwright/test";

test.describe("Launch checklist", () => {
  test("homepage exposes complete crawl metadata", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Yashwanth Medapati");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /software engineering and machine learning portfolio/i
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://yashwanthmedapati.com"
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/opengraph-image/
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      /\/twitter-image/
    );
    expect(await page.locator('link[rel="icon"]').count()).toBeGreaterThan(0);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);

    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    expect(structuredData).not.toContain("telephone");
    expect(structuredData).not.toContain("addressLocality");
  });

  test("server source contains real content", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain("<main");
    expect(html).toContain("Yashwanth Medapati");
    expect(html).toContain('application/ld+json');
  });

  test("robots, sitemap, manifest, and 404 routes are present", async ({ request, page }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap: https://yashwanthmedapati.com/sitemap.xml");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<loc>https://yashwanthmedapati.com/</loc>");

    const manifest = await request.get("/manifest.json");
    expect(manifest.status()).toBe(200);
    expect(await manifest.json()).toMatchObject({
      name: "Yashwanth Medapati",
      start_url: "/",
      display: "standalone",
    });

    await page.goto("/definitely-not-a-real-page");
    await expect(page).toHaveTitle("Page Not Found | Yashwanth Medapati");
    await expect(page.locator("h1")).toHaveText("This page drifted off the map.");
  });

  test("production page has no browser console errors or exposed source maps", async ({ page, request }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);

    const scripts = await page.locator('script[src*="/_next/static/"]').evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLScriptElement).src)
    );

    for (const scriptUrl of scripts.slice(0, 4)) {
      const sourceMap = await request.get(`${scriptUrl}.map`);
      const contentType = sourceMap.headers()["content-type"] ?? "";
      const body = await sourceMap.text();

      expect(contentType).not.toContain("application/json");
      expect(body).not.toContain('"sourcesContent"');
    }
  });
});
