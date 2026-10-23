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

for (const [lang, searchPath, route, title] of [
	[
		"pt",
		"/search/",
		"/instalando-servidor-web-apache-no-linux/",
		"Instalando o servidor web Apache no Linux",
	],
	[
		"en",
		"/en/search/",
		"/en/installing-the-apache-web-server-on-linux/",
		"Installing the Apache web server on Linux",
	],
]) {
	test(`real Pagefind results stay in ${lang}`, async ({ page }) => {
		await page.goto(searchPath);
		await page.locator("#search").fill("apache");
		const results = page.locator("#search-results .post-card--title");
		await expect(results.first()).toBeVisible();
		await expect(results.filter({ hasText: title })).toHaveCount(1);
		for (const href of await results.evaluateAll((links) =>
			links.map((link) => link.href),
		)) {
			expect(new URL(href).pathname.startsWith("/en/")).toBe(lang === "en");
		}
		await results.filter({ hasText: title }).click();
		await expect(page).toHaveURL(new RegExp(`${route}$`));
		await expect(page.locator("h1")).toHaveText(title);
	});
}

test("translated article switches reciprocally and resolves English references", async ({
	page,
}) => {
	await page.goto("/case-sensitive/");
	await page.locator('article a[href$="/en/case-sensitive/"]').click();
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
	await page
		.locator('.article-content a[href$="/en/the-camelcase-convention/"]')
		.click();
	await expect(page.locator("h1")).toHaveText("The CamelCase Convention");
	await page.locator('article a[href$="/o-padrao-camelcase/"]').click();
	await expect(page.locator("html")).toHaveAttribute("lang", "pt");
});

test("webfonts are local and all existing faces load", async ({ page }) => {
	const externalFonts = [];
	page.on("request", (request) => {
		if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) {
			externalFonts.push(request.url());
		}
	});
	await page.goto("/revisitando-o-layout-e-o-projeto-do-blog/");
	await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(4);
	const loaded = await page.evaluate(async () => {
		const faces = [
			'400 16px "PT Serif"',
			'700 16px "PT Serif"',
			'italic 400 16px "PT Serif"',
			'italic 700 16px "PT Serif"',
			'400 16px "Fjalla One"',
			'400 16px "Barlow Condensed"',
			'500 16px "Barlow Condensed"',
			'400 16px "Fira Mono"',
			'500 16px "Fira Mono"',
			'700 16px "Fira Mono"',
		];
		return Promise.all(
			faces.map(async (face) => {
				const fonts = await document.fonts.load(face, "João ação café");
				return fonts.length === 1 && fonts[0].status === "loaded";
			}),
		);
	});
	expect(loaded).toEqual(Array(10).fill(true));
	expect(externalFonts).toEqual([]);
});

test("slow webfonts do not move already-painted article content", async ({
	page,
}) => {
	await page.setViewportSize({ width: 412, height: 823 });
	await page.addInitScript(() => {
		window.fontLayoutShifts = 0;
		new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (!entry.hadRecentInput) window.fontLayoutShifts += entry.value;
			}
		}).observe({ type: "layout-shift", buffered: true });
	});
	let releaseFonts;
	const fontGate = new Promise((resolve) => {
		releaseFonts = resolve;
	});
	await page.route("**/fonts/*.woff2", async (route) => {
		await fontGate;
		await route.continue();
	});
	try {
		await page.goto("/revisitando-o-layout-e-o-projeto-do-blog/", {
			waitUntil: "domcontentloaded",
		});
		// Deliberately outlast optional display's short (~100ms) block period.
		await page.waitForTimeout(250);
		const article = page.locator(".article-content");
		await expect(article).toBeVisible();
		const before = await article.boundingBox();
		releaseFonts();
		await page.waitForLoadState("networkidle");
		expect(await article.boundingBox()).toEqual(before);
		expect(await page.evaluate(() => window.fontLayoutShifts)).toBeLessThan(
			0.1,
		);
	} finally {
		releaseFonts();
	}
});

test("article stays readable when webfonts are unavailable", async ({
	page,
}) => {
	await page.route("**/fonts/*.woff2", (route) => route.abort());
	await page.goto("/revisitando-o-layout-e-o-projeto-do-blog/");
	await expect(page.locator("h1")).toBeVisible();
	await expect(page.locator(".article-content")).toContainText(
		"Olá caros leitores",
	);
});

test("theme defaults to light with a visible toggle", async ({ page }) => {
	await page.goto("/");
	const toggle = page.locator("[data-theme-toggle]");
	await expect(toggle).toBeVisible();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
	await expect(
		page.getByRole("button", { name: "Mudar para o tema escuro" }),
	).toBeVisible();
	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
		"href",
		/images\/favicon\/manifest\.json$/,
	);
	await expect(
		page.locator('link[rel="icon"][type="image/svg+xml"]'),
	).toHaveAttribute("href", /images\/favicon\/favicon\.svg$/);
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
	const lightRequests = [];
	page.on("request", (request) => {
		if (/\/index\.svg$/.test(request.url())) {
			lightRequests.push(request.url());
		}
	});
	await page.goto("/en/");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	const card = page.locator(".post-card").filter({
		has: page.locator('a[href*="when-ai-decisions-become-software-inputs"]'),
	});
	await expect(card.locator(".theme-cover--dark")).toBeVisible();
	await expect(card.locator(".theme-cover--light")).toBeHidden();
	await expect
		.poll(() =>
			card.locator(".theme-cover--dark img").evaluate((img) => img.currentSrc),
		)
		.toMatch(/index\.dark\.svg$/);
	// The light <picture> is display:none + lazy, so it must never be fetched.
	await page.waitForLoadState("networkidle");
	expect(lightRequests).toEqual([]);
	await context.close();
});

test("post card cover follows the selected theme", async ({ page }) => {
	const darkRequests = [];
	page.on("request", (request) => {
		if (/\/index\.dark\.svg$/.test(request.url())) {
			darkRequests.push(request.url());
		}
	});
	await page.goto("/en/");
	const card = page.locator(".post-card").filter({
		has: page.locator('a[href*="when-ai-decisions-become-software-inputs"]'),
	});
	await expect(card.locator(".theme-cover--light")).toBeVisible();
	await expect(card.locator(".theme-cover--dark")).toBeHidden();
	await expect
		.poll(() =>
			card.locator(".theme-cover--light img").evaluate((img) => img.currentSrc),
		)
		.toMatch(/index\.svg$/);
	// Nothing may request the dark cover while the resolved theme is light.
	await page.waitForLoadState("networkidle");
	expect(darkRequests).toEqual([]);
	await page.locator("[data-theme-toggle]").click();
	await expect(card.locator(".theme-cover--light")).toBeHidden();
	await expect(card.locator(".theme-cover--dark")).toBeVisible();
	await page.reload();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(card.locator(".theme-cover--dark")).toBeVisible();
	await expect(card.locator(".theme-cover--light")).toBeHidden();
});

test("search result cover follows the selected theme", async ({
	page,
	baseURL,
}) => {
	const image = new URL(
		"/instalando-servidor-web-apache-no-linux/index.svg",
		baseURL,
	).href;
	const darkImage = image.replace(/index\.svg$/, "index.dark.svg");
	const darkRequests = [];
	page.on("request", (request) => {
		if (request.url() === darkImage) {
			darkRequests.push(request.url());
		}
	});
	await page.route("**/pagefind/pagefind.js", (route) =>
		route.fulfill({
			contentType: "text/javascript",
			body: `export async function options() {}
export async function search() {
  return { results: [{ data: async () => ({
    url: "/instalando-servidor-web-apache-no-linux/",
    meta: { title: "Apache", author: "JPC", image: ${JSON.stringify(image)}, image_dark: ${JSON.stringify(darkImage)} },
    excerpt: "Installing the server"
  }) }] };
}`,
		}),
	);
	await page.goto("/search/");
	await page.locator("#search").fill("apache");
	const cover = page.locator("#search-results .post-card");
	await expect(cover.locator(".theme-cover--light")).toBeVisible();
	await expect(cover.locator(".theme-cover--dark")).toBeHidden();
	await expect
		.poll(() =>
			cover
				.locator(".theme-cover--light img")
				.evaluate((img) => img.currentSrc),
		)
		.toBe(image);
	// Nothing may request the dark cover while the resolved theme is light.
	await page.waitForLoadState("networkidle");
	expect(darkRequests).toEqual([]);
	await page.locator("[data-theme-toggle]").click();
	await expect(cover.locator(".theme-cover--dark")).toBeVisible();
	await expect
		.poll(() =>
			cover.locator(".theme-cover--dark img").evaluate((img) => img.currentSrc),
		)
		.toBe(darkImage);
});

test("404 page renders layout, message and latest posts", async ({
	page,
	baseURL,
}) => {
	const response = await page.goto("/404.html");
	expect(response.status()).toBe(200); // direct file hit; unknown URLs are a Pages-level concern (verify-pages.sh)
	await expect(page.locator("h1")).toHaveText(
		"Erro 404 - Página Não Encontrada",
	);
	await expect(page.locator("[data-error404-path]")).toHaveText("/404.html");
	await expect(page.locator(".post-card")).toHaveCount(10); // paginate: 10 parity with the homepage
	const suggestions = page.locator("h2", { hasText: /artigos mais recentes/i });
	await expect(suggestions).toBeVisible();
	// PT cards only, first card links to a real post permalink.
	const ptHref = new URL(
		await page.locator(".post-card--title").first().getAttribute("href"),
	);
	expect(ptHref.origin).toBe(baseURL);
	expect(ptHref.pathname).toMatch(/^\/[^/]+\/$/);

	// EN variant renders the English copy with EN-only post links.
	await page.goto("/en/404.html");
	await expect(page.locator("h1")).toHaveText("Error 404 - Not Found");
	await expect(page.locator("[data-error404-path]")).toHaveText("/en/404.html");
	const enCount = await page.locator(".post-card").count();
	expect(enCount).toBeGreaterThan(0);
	expect(enCount).toBeLessThanOrEqual(10);
	const enHrefs = await page
		.locator(".post-card--title")
		.evaluateAll((links) => links.map((link) => link.getAttribute("href")));
	for (const href of enHrefs) {
		expect(href).toMatch(/\/en\//);
	}
});

test("404 page respects the dark theme", async ({ page }) => {
	await page.goto("/404.html");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
	await expect(page.locator("body")).toHaveCSS(
		"background-color",
		"rgb(255, 255, 255)",
	);
	await page.locator("[data-theme-toggle]").click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(page.locator("body")).toHaveCSS(
		"background-color",
		"rgb(25, 25, 25)",
	); // --color-canvas dark = #191919
	await expect(page.locator("[data-error404-path]")).toHaveCSS(
		"background-color",
		"rgb(42, 42, 42)",
	); // --color-code-bg dark
});

const TOGGLE_COPY = {
	"/": {
		toDark: "Mudar para o tema escuro",
		toLight: "Mudar para o tema claro",
		dark: "Tema escuro ativado",
		light: "Tema claro ativado",
	},
	"/en/": {
		toDark: "Switch to dark theme",
		toLight: "Switch to light theme",
		dark: "Dark theme enabled",
		light: "Light theme enabled",
	},
};

for (const [path, copy] of Object.entries(TOGGLE_COPY)) {
	test(`theme toggle name, status and size are stable (${path})`, async ({
		page,
	}) => {
		await page.goto(path);
		const toggle = page.locator("[data-theme-toggle]");
		const status = page.locator("[data-theme-toggle-status]");

		// Accessible name = action for the active theme; no stale pattern mix.
		await expect(toggle).toHaveAccessibleName(copy.toDark);
		await expect(toggle).not.toHaveAttribute("aria-pressed");
		await expect(toggle).not.toHaveAttribute("aria-label");
		await expect(toggle).not.toHaveAttribute("title");
		await expect(toggle).toHaveAttribute("type", "button");
		await expect(toggle.locator("svg")).toHaveCount(2);
		for (const svg of await toggle.locator("svg").all()) {
			await expect(svg).toHaveAttribute("aria-hidden", "true");
			await expect(svg).toHaveAttribute("focusable", "false");
			await expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
		}
		// Nothing is announced on page load.
		await expect(status).toHaveText("");

		const light = await toggle.boundingBox();
		expect(light.width).toBe(44);
		expect(light.height).toBe(44);

		// Keyboard operation (Enter) with a visible focus ring.
		await toggle.focus();
		await expect(toggle).toBeFocused();
		await expect(toggle).toHaveCSS("outline-style", "solid");
		await expect(toggle).toHaveCSS("outline-width", "2px");
		await page.keyboard.press("Enter");
		await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
		await expect(toggle).toHaveAccessibleName(copy.toLight);
		await expect(toggle).toBeFocused();
		await expect(status).toHaveText(copy.dark);
		await expect(toggle.locator(".theme-toggle__svg--sun")).toHaveCSS(
			"opacity",
			"1",
		);
		await expect(toggle.locator(".theme-toggle__svg--moon")).toHaveCSS(
			"opacity",
			"0",
		);

		const dark = await toggle.boundingBox();
		expect(dark.width).toBe(light.width);
		expect(dark.height).toBe(light.height);
		expect(dark.x).toBe(light.x);
		expect(dark.y).toBe(light.y);

		// Space toggles back.
		await page.keyboard.press("Space");
		await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
		await expect(toggle).toHaveAccessibleName(copy.toDark);
		await expect(status).toHaveText(copy.light);
		const back = await toggle.boundingBox();
		expect(back).toEqual(light);
	});
}

test("theme toggle label follows a persisted dark theme without announcing", async ({
	page,
}) => {
	await page.addInitScript(() => localStorage.setItem("theme", "dark"));
	await page.goto("/en/");
	await expect(page.locator("[data-theme-toggle]")).toHaveAccessibleName(
		"Switch to light theme",
	);
	await expect(page.locator("[data-theme-toggle-status]")).toHaveText("");
});

test("theme toggle motion is disabled under reduced motion", async ({
	browser,
}) => {
	const context = await browser.newContext({ reducedMotion: "reduce" });
	const page = await context.newPage();
	await page.goto("/en/");
	const toggle = page.locator("[data-theme-toggle]");
	await toggle.click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	for (const icon of await toggle.locator(".theme-toggle__svg").all()) {
		await expect(icon).toHaveCSS("transition-duration", "0s");
	}
	await expect(page.locator("main, body").first()).toHaveCSS(
		"transition-duration",
		"0s",
	);
	await context.close();
});

test("theme toggle animates the icon swap with motion allowed", async ({
	browser,
}) => {
	const context = await browser.newContext({ reducedMotion: "no-preference" });
	const page = await context.newPage();
	await page.goto("/en/");
	const sun = page.locator(".theme-toggle__svg--sun");
	await expect(sun).toHaveCSS("transition-duration", /0\.3s|0\.2s/);
	await context.close();
});
