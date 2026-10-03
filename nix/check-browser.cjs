const assert = require("node:assert/strict");
const { accessSync, constants } = require("node:fs");
const { chromium } = require("@playwright/test");
const { version } = require("playwright-core/package.json");

(async () => {
	assert.equal(version, "1.63.0");
	accessSync(process.env.CHROME_PATH, constants.X_OK);
	const browser = await chromium.launch({ args: ["--no-sandbox"] });
	try {
		const page = await browser.newPage();
		await page.setContent("<title>Nix browser check</title>");
		assert.equal(await page.title(), "Nix browser check");
		console.log(
			`Playwright ${version}: Chromium ${browser.version()} launched`,
		);
	} finally {
		await browser.close();
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
