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
		const brokenImages = await page.locator("img").evaluateAll((images) =>
			images
				.filter((image) => {
					const rect = image.getBoundingClientRect();
					const shouldBeLoaded =
						image.loading !== "lazy" ||
						(rect.top < window.innerHeight && rect.bottom > 0);
					return (
						image.getClientRects().length > 0 &&
						shouldBeLoaded &&
						(!image.complete || image.naturalWidth === 0)
					);
				})
				.map((image) => image.src),
		);
		expect(brokenImages).toEqual([]);
		await expect(page).toHaveScreenshot(`${name}.png`, {
			fullPage: true,
		});
	});
}
