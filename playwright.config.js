const { defineConfig } = require("@playwright/test");

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
			...(process.env.JPEGTRAN ? { JPEGTRAN: process.env.JPEGTRAN } : {}),
		},
		url: "http://127.0.0.1:1313/",
		reuseExistingServer: false,
		timeout: 120 * 1000,
	},
});
