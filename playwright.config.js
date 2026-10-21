const { defineConfig } = require("@playwright/test");

const port = Number(process.env.PLAYWRIGHT_PORT || 1313);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error("PLAYWRIGHT_PORT must be a valid TCP port");
}
const baseURL = `http://127.0.0.1:${port}`;

module.exports = defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	use: {
		baseURL,
		trace: "retain-on-failure",
	},
	webServer: {
		// Build as staging does so English covers and site icons exist locally.
		command: `npm run build && npm run images && npm run search:index && python3 -m http.server ${port} --bind 127.0.0.1 --directory public`,
		env: {
			BASE_URL: `${baseURL}/`,
			...(process.env.JPEGTRAN ? { JPEGTRAN: process.env.JPEGTRAN } : {}),
		},
		url: `${baseURL}/`,
		reuseExistingServer: false,
		// The complete bilingual image pipeline renders/optimizes 150 covers.
		timeout: 600 * 1000,
	},
});
