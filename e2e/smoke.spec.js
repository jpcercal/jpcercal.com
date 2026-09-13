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
});

test("theme toggle switches to dark and persists", async ({ page }) => {
	await page.goto("/");
	await page.locator("[data-theme-toggle]").click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
	await page.reload();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("os dark scheme renders dark theme by default", async ({ browser }) => {
	const context = await browser.newContext({ colorScheme: "dark" });
	const page = await context.newPage();
	await page.goto("/");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await context.close();
});
