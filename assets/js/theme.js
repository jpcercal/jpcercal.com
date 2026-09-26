/**
 * Dark-theme toggle.
 *
 * The init script in head-assets.html already set data-theme before CSS
 * painted (stored choice, else OS setting, else light). This wires the
 * header button, persists the choice in localStorage, and keeps following
 * the OS setting while no explicit choice is stored.
 */
document.addEventListener("DOMContentLoaded", () => {
	const STORAGE_KEY = "theme";
	const DARK_CANVAS = "#191919";
	const LIGHT_CANVAS = "#ffffff";

	const toggle = document.querySelector("[data-theme-toggle]");
	if (!toggle) {
		return;
	}

	const readStored = () => {
		try {
			return localStorage.getItem(STORAGE_KEY);
		} catch {
			return null;
		}
	};

	const apply = (theme, persist) => {
		const root = document.documentElement;
		root.setAttribute("data-theme", theme);
		root.style.colorScheme = theme;
		toggle.setAttribute("aria-pressed", String(theme === "dark"));

		const assetHref = theme === "dark" ? "data-dark-href" : "data-light-href";
		for (const asset of document.querySelectorAll(
			"[data-light-href][data-dark-href]",
		)) {
			asset.setAttribute("href", asset.getAttribute(assetHref));
		}

		const assetContent =
			theme === "dark" ? "data-dark-content" : "data-light-content";
		for (const asset of document.querySelectorAll(
			"[data-light-content][data-dark-content]",
		)) {
			asset.setAttribute("content", asset.getAttribute(assetContent));
		}

		// <picture> covers: the <source> media follows the OS, so translate a
		// stored override into an explicit all/not-all media query. A later
		// OS change (while nothing is stored) re-runs apply() and re-syncs.
		for (const source of document.querySelectorAll(
			"picture[data-theme-picture] > source",
		)) {
			source.media = theme === "dark" ? "all" : "not all";
		}

		const tag = document.querySelector('meta[name="theme-color"]');
		if (tag) {
			tag.setAttribute(
				"content",
				theme === "dark" ? DARK_CANVAS : LIGHT_CANVAS,
			);
		}

		if (persist) {
			try {
				localStorage.setItem(STORAGE_KEY, theme);
			} catch {
				// Private mode etc: the theme still applies for this visit.
			}
		}
	};

	// Reveal the button (it ships hidden so no-JS visitors never see a
	// dead control) and reflect the theme the init script resolved.
	toggle.removeAttribute("hidden");
	apply(
		document.documentElement.getAttribute("data-theme") === "dark"
			? "dark"
			: "light",
		false,
	);

	toggle.addEventListener("click", () => {
		apply(
			document.documentElement.getAttribute("data-theme") === "dark"
				? "light"
				: "dark",
			true,
		);
	});

	// Follow OS changes until the visitor picks explicitly.
	if (window.matchMedia) {
		window
			.matchMedia("(prefers-color-scheme: dark)")
			.addEventListener("change", (event) => {
				if (!readStored()) {
					apply(event.matches ? "dark" : "light", false);
				}
			});
	}
});
