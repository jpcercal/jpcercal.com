const { test, expect } = require("@playwright/test");

// Snapshots are platform-specific (font rasterization differs per OS), so
// these run locally only. CI covers parity via LHCI + html-validate + lychee.
test.skip(!!process.env.CI, "visual baselines are platform-specific");

const pages = [
	["home", "/"],
	["search", "/search/"],
	["contact", "/contact/"],
	["english", "/en/"],
	["post", "/revisiting-the-layout-and-the-blog-project/"],
];

for (const [name, url] of pages) {
	test(`visual ${name}`, async ({ page }) => {
		await page.goto(url, { waitUntil: "networkidle" });
		await page.evaluate(() => document.fonts.ready);
		await expect(page).toHaveScreenshot(`${name}.png`, {
			fullPage: true,
		});
	});
}
