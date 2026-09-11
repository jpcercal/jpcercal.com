import * as params from "@params";
import { createTranslator } from "./i18n.js";

document.addEventListener("DOMContentLoaded", () => {
	const config = {
		timer: null, // Store the timer
		delay: 750, // Delay in ms to start processing the operation
		minChars: 3, // Minimum quantity of characters that the user must input to perform the operation
	};

	let lunrIndex; // Store the Lunr index where the results will be compared with the term
	let template; // Store the template that will be parsed
	let source; // Store the data that will be be used to search for a term

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
	 * Create and configure the Lunr Index.
	 *
	 * @retuns {lunr.Index}
	 */
	const createLunrIndex = () =>
		lunr(function () {
			this.field("title", {
				boost: 50,
			});

			this.field("description", {
				boost: 25,
			});

			this.field("categoryTitle", {
				boost: 20,
			});

			this.field("tags", {
				boost: 15,
			});

			this.field("content", {
				boost: 10,
			});

			this.field("author", {
				boost: 5,
			});

			this.field("language", {
				boost: 2,
			});

			this.ref("id");

			source.forEach(function (doc) {
				this.add(doc);
			}, this);
		});

	/**
	 * Search in the whole collection if there is a match with the current term.
	 *
	 * @param term
	 * @returns {Array}
	 */
	const search = (term) => {
		const suggestions = [];

		lunrIndex.search(`*${term}*`).forEach((result) => {
			source.forEach((current) => {
				if (String(current.id) === result.ref) {
					suggestions.push(current);
				}
			});
		});

		return suggestions;
	};

	/**
	 * Render a HTML replacing values from template according to the suggestion that was received.
	 *
	 * @param suggestion
	 * @returns {string}
	 */
	const renderHtml = (suggestion) => {
		const baseUrl =
			params.baseUrl + (suggestion.language === "en" ? "en/" : "");

		const authorPrefix = i18n.trans("createdBy");

		return template
			.split("__ID__")
			.join(suggestion.id)
			.split("__TITLE__")
			.join(suggestion.title)
			.split("__AUTHOR__")
			.join(`${authorPrefix} ${suggestion.author}`)
			.split("__DESCRIPTION__")
			.join(suggestion.description)
			.split("__LANGUAGE__")
			.join(suggestion.language)
			.split("__TAGS__")
			.join(suggestion.tags.join(", "))
			.split("__IMAGE__")
			.join(baseUrl + suggestion.image)
			.split("__CATEGORYURL__")
			.join(`${baseUrl}categories/${suggestion.categoryUrl}`)
			.split("__CATEGORYTITLE__")
			.join(suggestion.categoryTitle)
			.split("__CONTENT__")
			.join(suggestion.content)
			.split("__HREF__")
			.join(baseUrl + suggestion.slug);
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
			let suggestions = [];
			let html = "";

			if (term.length >= config.minChars) {
				suggestions = search(term);

				searchResults.innerHTML = html;

				if (suggestions.length === 0) {
					html = `<p>“${i18n.trans("noResults")}.”</p>`;
				} else {
					for (let i = 0; i < suggestions.length; i++) {
						html += renderHtml(suggestions[i]);
					}
				}

				searchResults.innerHTML = html;
			}
		}, config.delay);
	};

	/**
	 * Process the template file and source data that contains searchable results.
	 *
	 * @param searchTemplate
	 * @param searchData
	 */
	const process = (searchTemplate, searchData) => {
		template = searchTemplate.data.trim();
		source = searchData.data;

		lunrIndex = createLunrIndex();

		inputField.addEventListener("keyup", listener);
		inputField.addEventListener("input", listener);
	};

	/**
	 * Load dependencies with the fetch API (response shapes are adapted to
	 * the { data } objects process() expects, matching the old axios
	 * behavior including rejection on HTTP errors).
	 */
	const promises = Promise.all([
		fetch(`${params.baseUrl}search-template.html`).then((response) => {
			if (!response.ok) {
				throw new Error(`search template: ${response.status}`);
			}

			return response.text().then((text) => ({ data: text }));
		}),
		fetch(`${params.baseUrl}search.json`).then((response) => {
			if (!response.ok) {
				throw new Error(`search index: ${response.status}`);
			}

			return response.json().then((json) => ({ data: json }));
		}),
	]);

	/**
	 * Start processing.
	 */
	promises.then((results) => {
		process(results[0], results[1]);
	});
});
