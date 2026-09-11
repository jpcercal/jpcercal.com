/**
 * Shared notification component.
 *
 * Extracted verbatim from the old contact.js notifier IIFE; the container
 * element is injected so the module stays DOM-agnostic.
 */
export const createNotifier = (container) => {
	const createElement = (tagName, classes) => {
		const element = document.createElement(tagName);
		element.setAttribute("class", classes.join(" "));

		return element;
	};

	return {
		TYPE: {
			ERROR: "error",
			SUCCESS: "success",
		},
		notify: function (message, type) {
			const classes = ["notification"];

			if (type === this.TYPE.ERROR || type === this.TYPE.SUCCESS) {
				classes.push(`notification--${type}`);
			}

			const element = createElement("p", classes);

			element.innerHTML = message;

			container.innerHTML = "";
			container.appendChild(element);
		},
	};
};
