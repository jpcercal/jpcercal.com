import * as params from "@params";
import { createTranslator } from "./i18n.js";

document.addEventListener("DOMContentLoaded", () => {
	const config = {
		timer: null, // Store the timer
		delay: 750, // Delay in ms to start processing the operation
		minChars: 3, // Minimum quantity of characters that the user must input to perform the operation
	};

	/**
	 * Input field where the user will put the terms that he wants search for.
	 *
	 * @type {Element}
	 */
	const inputField = document.querySelector("#search");

	/**
	 * Element that will contains all results (as know as container).
	 *
	 * @type {Element}
	 */
	const searchResults = document.querySelector("#search-results");

	/**
	 * Internationalization keys and translations for each locale.
	 *
	 * @type {{trans}}
	 */
	const i18n = createTranslator(
		{
			createdBy: {
				pt: "por",
				en: "by",
			},
			noResults: {
				pt: "Nenhum resultado encontrado",
				en: "No results found",
			},
		},
		params.locale,
	);

	/**
	 * Pagefind ships as an ES module (public/pagefind/pagefind.js); import
	 * it dynamically and point it at the bundle directory (staging serves
	 * under /pr-<n>/) so it fetches its fragments from the right place.
	 */
	const pagefindReady = import(`${params.baseUrl}pagefind/pagefind.js`).then(
		(pagefind) =>
			pagefind
				.options({
					basePath: new URL("pagefind/", params.baseUrl).pathname,
				})
				.then(() => pagefind),
	);

	// Silent failure keeps parity with the old fetch behavior: nothing
	// renders until results arrive (also covers `hugo server` dev, which
	// has no pagefind index — search only works in built output).
	pagefindReady.catch(() => {});

	/**
	 * Render a result card (same shape as the post-card partial).
	 *
	 * @param result Pagefind result data ({url, meta, excerpt})
	 * @returns {string}
	 */
	const renderHtml = (result) => {
		const authorPrefix = i18n.trans("createdBy");
		const image = result.meta.image || `${params.baseUrl}images/icons/tag.svg`;

		return (
			`<article class="post-card mb-6">` +
			`<div class="flex"><div class="flex-col m-4">` +
			`<img class="rounded" src="${image}" alt="${result.meta.title}" height="60" width="60">` +
			`</div><header class="flex-col m-0">` +
			`<h2 class="mt-0 mb-0 font-size-h4">` +
			`<a class="mt-4 mb-1 post-card--title" href="${result.url}">${result.meta.title}</a>` +
			`</h2>` +
			`<ul class="flex list-none gap-2"><li><span>${authorPrefix} ${result.meta.author}</span></li></ul>` +
			`<p class="mt-2 mb-4 mr-2">${result.excerpt}</p>` +
			`</header></div></article>`
		);
	};

	/**
	 * Event Listener.
	 *
	 * @param event
	 */
	const listener = (event) => {
		event.preventDefault();

		const term = inputField.value;

		if (config.timer != null) {
			clearTimeout(config.timer);
		}

		config.timer = setTimeout(() => {
			if (term.length >= config.minChars) {
				pagefindReady
					.then((pagefind) =>
						pagefind.search(term, { filters: { type: ["post"] } }),
					)
					.then(async (search) => {
						const data = await Promise.all(
							search.results.map((result) => result.data()),
						);

						if (data.length === 0) {
							searchResults.innerHTML = `<p>“${i18n.trans("noResults")}.”</p>`;
						} else {
							searchResults.innerHTML = data.map(renderHtml).join("");
						}
					});
			}
		}, config.delay);
	};

	inputField.addEventListener("keyup", listener);
	inputField.addEventListener("input", listener);
});
