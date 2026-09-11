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
		// Hugo Pipes (Dart Sass, Tailwind) resolve their binaries from
		// node_modules/.bin, which must be on PATH for the server too.
		// --renderToMemory keeps the dev server from writing into public/.
		command:
			"PATH='./node_modules/.bin:'$PATH hugo server --bind 127.0.0.1 --port 1313 --disableFastRender --renderToMemory",
		url: "http://127.0.0.1:1313/",
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
