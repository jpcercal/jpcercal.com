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

for (const [path, toDark, toLight, darkOn, lightOn] of [
	[
		"/",
		"Mudar para o tema escuro",
		"Mudar para o tema claro",
		"Tema escuro ativado",
		"Tema claro ativado",
	],
	[
		"/en/",
		"Switch to dark theme",
		"Switch to light theme",
		"Dark theme enabled",
		"Light theme enabled",
	],
]) {
	test(`theme toggle name, status and size are correct at ${path}`, async ({
		page,
	}) => {
		await page.goto(path);
		const toggle = page.locator("[data-theme-toggle]");
		const status = page.locator("[data-theme-toggle-status]");

		// One accessibility pattern only: a dynamic name, never pressed state.
		await expect(toggle).toBeVisible();
		for (const attr of ["aria-pressed", "aria-label", "title"]) {
			await expect(toggle).not.toHaveAttribute(attr, /.*/);
		}
		await expect(page.getByRole("button", { name: toDark })).toBeVisible();
		await expect(status).toHaveText("");

		const before = await toggle.boundingBox();
		expect(before.width).toBe(68);
		expect(before.height).toBe(44);

		await toggle.click();
		await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
		await expect(page.getByRole("button", { name: toLight })).toBeVisible();
		await expect(status).toHaveText(darkOn);
		const afterDark = await toggle.boundingBox();
		expect(afterDark).toEqual(before);

		await toggle.click();
		await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
		await expect(page.getByRole("button", { name: toDark })).toBeVisible();
		await expect(status).toHaveText(lightOn);
		expect(await toggle.boundingBox()).toEqual(before);
	});
}

test("theme toggle is keyboard operable and keeps focus", async ({ page }) => {
	await page.goto("/en/");
	const toggle = page.locator("[data-theme-toggle]");
	await toggle.focus();
	await page.keyboard.press("Enter");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(toggle).toBeFocused();
	await page.keyboard.press("Space");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
	await expect(toggle).toBeFocused();
});

test("theme toggle does not announce on load or OS-driven changes", async ({
	browser,
}) => {
	const context = await browser.newContext({ colorScheme: "dark" });
	const page = await context.newPage();
	await page.goto("/en/");
	const status = page.locator("[data-theme-toggle-status]");
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await expect(
		page.getByRole("button", { name: "Switch to light theme" }),
	).toBeVisible();
	await expect(status).toHaveText("");
	await page.emulateMedia({ colorScheme: "light" });
	await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
	await expect(status).toHaveText("");
	await context.close();
});

test("theme toggle honors prefers-reduced-motion", async ({ browser }) => {
	for (const [reducedMotion, expected] of [
		["reduce", "0s"],
		["no-preference", "0.25s"],
	]) {
		const context = await browser.newContext({ reducedMotion });
		const page = await context.newPage();
		await page.goto("/en/");
		const duration = await page
			.locator(".theme-toggle__thumb")
			.evaluate((el) => getComputedStyle(el).transitionDuration);
		expect(duration.split(",")[0].trim()).toBe(expected);
		await context.close();
	}
});

// Browsers do not start CSS transitions before the first rendered frame, so
// fade tests must let the page paint once before clicking the toggle.
async function settleFirstFrames(page) {
	await page.evaluate(
		() =>
			new Promise((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(resolve)),
			),
	);
}

test("theme fade animates tokens on <html> only, not every element", async ({
	page,
}) => {
	// Per-element colour transitions make children that inherit `color`
	// chase their parent's animated value and lag behind it (dark text on a
	// dark canvas mid-fade). The fade must live on the registered tokens.
	await page.goto("/revisitando-o-layout-e-o-projeto-do-blog/");
	const result = await page.evaluate(() => {
		document.documentElement.setAttribute("data-theme-transition", "");
		const offenders = [];
		for (const el of document.querySelectorAll("body *")) {
			const cs = getComputedStyle(el);
			const props = cs.transitionProperty.split(",").map((p) => p.trim());
			const animated = props.filter(
				(p) => p !== "all" && /color|fill|stroke/.test(p),
			);
			const allWithDuration =
				props.includes("all") && !/^0s(, 0s)*$/.test(cs.transitionDuration);
			if (animated.length || allWithDuration) {
				offenders.push(`${el.tagName}.${el.className}`);
			}
		}
		document.documentElement.removeAttribute("data-theme-transition");
		const root = getComputedStyle(document.documentElement);
		return { offenders, rootProperty: root.transitionProperty };
	});
	expect(result.offenders).toEqual([]);
	expect(result.rootProperty).toBe("all");

	await page.evaluate(() => {
		document.documentElement.setAttribute("data-theme-transition", "");
	});
	const during = await page.evaluate(() => {
		const cs = getComputedStyle(document.documentElement);
		return { property: cs.transitionProperty, duration: cs.transitionDuration };
	});
	expect(during.property).toContain("--color-ink");
	expect(during.property).toContain("--color-canvas");
	expect(during.duration.split(",")[0].trim()).toBe("0.2s");
});

test("theme fade keeps inherited text in lockstep with its parent", async ({
	page,
}) => {
	await page.goto("/revisitando-o-layout-e-o-projeto-do-blog/");
	await settleFirstFrames(page);
	const samples = await page.evaluate(async () => {
		const link = document.querySelector(".article-content p a");
		const parent = link.parentElement;
		document.querySelector("[data-theme-toggle]").click();
		const frames = [];
		const start = performance.now();
		await new Promise((resolve) => {
			const tick = () => {
				frames.push({
					link: getComputedStyle(link).color,
					parent: getComputedStyle(parent).color,
				});
				// Run until the fade has finished (capped), not for a fixed time:
				// the first frame can land late on a busy runner.
				const elapsed = performance.now() - start;
				if (document.getAnimations().length > 0 && elapsed < 3000) {
					requestAnimationFrame(tick);
				} else {
					resolve();
				}
			};
			requestAnimationFrame(tick);
		});
		return frames;
	});
	for (const frame of samples) {
		expect(frame.link).toBe(frame.parent);
	}
	// The fade really ran (initial, at least one in-between, final colour);
	// otherwise the lockstep check above would pass vacuously.
	expect(new Set(samples.map((frame) => frame.link)).size).toBeGreaterThan(2);
	// Settled on the dark ink (a light colour), not stuck on the light one.
	expect(samples.at(-1).link).toBe("rgba(255, 255, 255, 0.68)");
});

test("theme toggle glyphs never change colour when the theme switches", async ({
	page,
}) => {
	// The ink glyphs sit on the track and the canvas glyphs inside the thumb;
	// recolouring a single set made glyphs vanish for a few frames.
	await page.goto("/en/");
	await settleFirstFrames(page);
	const { before, after } = await page.evaluate(async () => {
		const read = () =>
			[...document.querySelectorAll(".theme-toggle__svg")].map(
				(svg) => getComputedStyle(svg).color,
			);
		const before = read();
		document.querySelector("[data-theme-toggle]").click();
		// The fade starts at the first frame after the click; at that point it
		// has not advanced, so any difference would be a selector-driven
		// (instant) colour swap.
		const after = await new Promise((resolve) =>
			requestAnimationFrame(() => resolve(read())),
		);
		return { before, after };
	});
	expect(before).toHaveLength(4);
	expect(after).toEqual(before);
	await page.waitForTimeout(400);
	const settled = await page.evaluate(() => {
		const color = (selector) =>
			getComputedStyle(document.querySelector(selector)).color;
		return {
			track: color(".theme-toggle--icon > .theme-toggle__svg--sun"),
			thumb: color(".theme-toggle__thumb .theme-toggle__svg--sun"),
			canvas: getComputedStyle(document.body).backgroundColor,
		};
	});
	expect(settled.track).toBe("rgba(255, 255, 255, 0.92)");
	expect(settled.thumb).toBe("rgb(25, 25, 25)");
	expect(settled.canvas).toBe("rgb(25, 25, 25)");
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

for (const [lang, route] of [
	["pt", "/php2shell-duas-vulnerabilidades-criticas-no-php/"],
	["en", "/en/php2shell-two-critical-php-vulnerabilities/"],
]) {
	test(`wide article tables scroll horizontally on a narrow viewport (${lang})`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 500, height: 900 });
		await page.goto(route);

		const table = page.locator(".article-content table").first();
		const region = page.locator(".article-content .table-scroll").first();
		await expect(table).toBeAttached();

		// The table is wider than the article column; `.article-content` clips
		// overflow, so without its own scroll box the right columns are unreachable.
		const m = await region.evaluate((el) => ({
			overflowX: getComputedStyle(el).overflowX,
			scrollWidth: el.scrollWidth,
			clientWidth: el.clientWidth,
			docScrollWidth: document.documentElement.scrollWidth,
		}));
		expect(m.overflowX).toBe("auto");
		expect(m.scrollWidth).toBeGreaterThan(m.clientWidth);
		expect(m.docScrollWidth).toBeLessThanOrEqual(500);

		// Last column must actually be reachable by scrolling the region.
		await region.evaluate((el) => {
			el.scrollLeft = el.scrollWidth;
		});
		const lastCell = table.locator("tr").first().locator("th, td").last();
		const [cell, box] = await Promise.all([
			lastCell.boundingBox(),
			region.boundingBox(),
		]);
		expect(cell.x + cell.width).toBeLessThanOrEqual(box.x + box.width + 1);

		// Keyboard users must be able to scroll it.
		await region.focus();
		await expect(region).toBeFocused();
		await expect(region).toHaveRole("region");
		await expect(region).toHaveAttribute("aria-label", /.+/);
	});
}
