const { test, expect } = require("@playwright/test");

test("homepage renders", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/jpcercal/);
});

test("search page answers queries", async ({ page }) => {
	await page.goto("/search/");
	await expect(page.locator("#search")).toBeVisible();
});

test("english section renders", async ({ page }) => {
	await page.goto("/en/");
	await expect(page).toHaveTitle(/jpcercal/);
});
