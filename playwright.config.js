const { defineConfig } = require("@playwright/test");
const { existsSync } = require("node:fs");

const localMozjpeg = [
	"/opt/homebrew/opt/mozjpeg/bin/jpegtran",
	"/usr/local/opt/mozjpeg/bin/jpegtran",
].find(existsSync);

module.exports = defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	use: {
		baseURL: "http://127.0.0.1:1313",
		trace: "retain-on-failure",
	},
	webServer: {
		// Build as staging does so English covers and site icons exist locally.
		command:
			"npm run build && npm run images && npm run search:index && python3 -m http.server 1313 --bind 127.0.0.1 --directory public",
		env: {
			BASE_URL: "http://127.0.0.1:1313/",
			...(process.env.JPEGTRAN || localMozjpeg
				? { JPEGTRAN: process.env.JPEGTRAN || localMozjpeg }
				: {}),
		},
		url: "http://127.0.0.1:1313/",
		reuseExistingServer: false,
		timeout: 120 * 1000,
	},
});
