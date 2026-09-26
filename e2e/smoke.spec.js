const { test, expect } = require("@playwright/test");

test("homepage renders", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/jpcercal/);
});

test("search page answers queries", async ({ page }) => {
	await page.goto("/search/");
	await expect(page.locator("#search")).toBeVisible();
});

test("contact page lists static contact links", async ({ page }) => {
	await page.goto("/contact/");
	await expect(page.locator('a[href^="mailto:"]')).toBeVisible();
	await expect(page.locator("#contact-form")).toHaveCount(0);
});

test("english section renders", async ({ page }) => {
	await page.goto("/en/");
	await expect(page).toHaveTitle(/jpcercal/);
});

test("theme defaults to light with a visible toggle", async ({ page }) => {
	await page.goto("/");
	const toggle = page.locator("[data-theme-toggle]");
	await expect(toggle).toBeVisible();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
	await expect(toggle).toHaveAttribute("aria-pressed", "false");
	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
		"href",
		/images\/favicon\/manifest\.json$/,
	);
	await expect(
		page.locator('link[rel="icon"][type="image/svg+xml"]'),
	).toHaveAttribute("href", /images\/favicon\/favicon-light\.svg$/);
});

test("theme toggle switches to dark and persists", async ({ page }) => {
	await page.goto("/");
	await page.locator("[data-theme-toggle]").click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
		"href",
		/images\/favicon\/manifest\.dark\.json$/,
	);
	await expect(
		page.locator('link[rel="icon"][type="image/svg+xml"]'),
	).toHaveAttribute("href", /images\/favicon\/favicon-dark\.svg$/);
	await expect(
		page.locator('link[rel="apple-touch-icon"][sizes="180x180"]'),
	).toHaveAttribute("href", /images\/favicon\/apple-icon-180x180\.dark\.png$/);
	expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
	await page.reload();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
		"href",
		/images\/favicon\/manifest\.dark\.json$/,
	);
	const icoSizes = await page
		.locator('link[rel="icon"][type="image/x-icon"]')
		.getAttribute("sizes");
	expect(icoSizes).toBeTruthy();
	expect(icoSizes).not.toMatch(/(^|\s)(16x16|32x32)(\s|$)/);
});

test("os dark scheme renders dark theme by default", async ({ browser }) => {
	const context = await browser.newContext({ colorScheme: "dark" });
	const page = await context.newPage();
	await page.goto("/en/");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	const card = page.locator(".post-card").filter({
		has: page.locator('a[href*="when-ai-decisions-become-software-inputs"]'),
	});
	const cover = card.locator("img.post-card--icon");
	await expect
		.poll(() => cover.evaluate((img) => img.currentSrc))
		.toMatch(/index\.dark\.svg$/);
	await context.close();
});

test("post card cover follows the selected theme", async ({ page }) => {
	await page.goto("/en/");
	const card = page.locator(".post-card").filter({
		has: page.locator('a[href*="when-ai-decisions-become-software-inputs"]'),
	});
	const cover = card.locator("img.post-card--icon");
	await expect
		.poll(() => cover.evaluate((img) => img.currentSrc))
		.toMatch(/index\.svg$/);
	await page.locator("[data-theme-toggle]").click();
	await expect
		.poll(() => cover.evaluate((img) => img.currentSrc))
		.toMatch(/index\.dark\.svg$/);
	await page.reload();
	await expect
		.poll(() => cover.evaluate((img) => img.currentSrc))
		.toMatch(/index\.dark\.svg$/);
});

test("search result cover follows the selected theme", async ({ page }) => {
	const image =
		"http://127.0.0.1:1313/instalando-servidor-web-apache-no-linux/index.svg";
	await page.route("**/pagefind/pagefind.js", (route) =>
		route.fulfill({
			contentType: "text/javascript",
			body: `export async function options() {}
export async function search() {
  return { results: [{ data: async () => ({
    url: "/instalando-servidor-web-apache-no-linux/",
    meta: { title: "Apache", author: "JPC", image: ${JSON.stringify(image)} },
    excerpt: "Installing the server"
  }) }] };
}`,
		}),
	);
	await page.goto("/search/");
	await page.locator("#search").fill("apache");
	const cover = page.locator("#search-results .post-card img.post-card--icon");
	await expect.poll(() => cover.evaluate((img) => img.currentSrc)).toBe(image);
	await page.locator("[data-theme-toggle]").click();
	await expect
		.poll(() => cover.evaluate((img) => img.currentSrc))
		.toBe(image.replace(/index\.svg$/, "index.dark.svg"));
});
