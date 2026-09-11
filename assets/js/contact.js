document.addEventListener("DOMContentLoaded", () => {
	var form = document.querySelector("#contact-form");
	var email = document.querySelector("#email");
	var name = document.querySelector("#name");
	var message = document.querySelector("#message");
	var submit = document.querySelector("#send");
	var notification = document.querySelector("#notification-container");

	/**
	 * Internationalization keys and translations for each locale.
	 *
	 * @type {{trans}}
	 */
	var i18n = (() => {
		var translations = {
			missingData: {
				pt: "Todos os campos são obrigatórios!",
				en: "All fields are mandatory!",
			},
			incorrectData: {
				pt: "Alguma coisa que você preencheu parece estar errada...",
				en: "Something you filled in seems to be wrong...",
			},
			sendingData: {
				pt: "Enviando dados...",
				en: "Sending data...",
			},
			success: {
				pt: "Formulário enviado com sucesso!",
				en: "Form submitted successfully!",
			},
			error: {
				pt: "Ops, alguma coisa deu errada com nosso serviço. =/",
				en: "Ops, something is wrong with our service. =/",
			},
		};

		return {
			trans: (key) => translations[key][window.locale],
		};
	})();

	/**
	 * Notify the customer with a message.
	 *
	 * @type {{TYPE, notify}}
	 */
	var notifier = (() => {
		var createElement = (tagName, classes) => {
			var element = document.createElement(tagName);
			element.setAttribute("class", classes.join(" "));

			return element;
		};

		return {
			TYPE: {
				ERROR: "error",
				SUCCESS: "success",
			},
			notify: function (message, type) {
				var classes = ["notification"];

				if (type === this.TYPE.ERROR || type === this.TYPE.SUCCESS) {
					classes.push(`notification--${type}`);
				}

				var element = createElement("p", classes);

				element.innerHTML = message;

				notification.innerHTML = "";
				notification.appendChild(element);
			},
		};
	})();

	/**
	 * Validation component to validate simple data that comes from the user.
	 *
	 * @type {{isValid}}
	 */
	var validator = (() => {
		var isValidEmail = (email) => {
			var regex =
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			return regex.test(email.toLowerCase());
		};

		var isMissing = (name, email, message) => {
			if (name.length === 0) {
				return true;
			}

			if (email.length === 0) {
				return true;
			}

			if (message.length === 0) {
				return true;
			}

			return false;
		};

		var isValid = (name, email, message) => {
			if (isMissing(name, email, message)) {
				return false;
			}

			if (!isValidEmail(email)) {
				return false;
			}

			return true;
		};

		return {
			isMissing: isMissing,
			isValid: isValid,
		};
	})();

	var userInfo = (() => {
		var ip = "";

		axios.get("//api.ipify.org?format=json").then((response) => {
			if (response.status === 200) {
				ip = response.data.ip;
			}
		});

		return {
			getIp: () => ip,
		};
	})();

	/**
	 * Event listener.
	 *
	 * @param event
	 */
	var listener = (event) => {
		event.preventDefault();

		submit.disabled = true;

		if (validator.isMissing(name.value, email.value, message.value)) {
			submit.disabled = false;

			return notifier.notify(i18n.trans("missingData"), notifier.TYPE.ERROR);
		}

		if (!validator.isValid(name.value, email.value, message.value)) {
			submit.disabled = false;

			return notifier.notify(i18n.trans("incorrectData"), notifier.TYPE.ERROR);
		}

		notifier.notify(i18n.trans("sendingData"));

		var cc = ["jpcercal@gmail.com"];

		var params = new URLSearchParams();
		params.append("_cc", cc.join(","));
		params.append("_subject", `[via @jpcercal.com] ${name.value}`);
		params.append("email", email.value);
		params.append("name", name.value);
		params.append("message", message.value);
		params.append("ip", userInfo.getIp());

		var config = {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			},
		};

		axios
			.post("//formspree.io/contact@jpcercal.com", params, config)
			.then((response) => {
				if (response.status === 200) {
					notifier.notify(i18n.trans("success"), notifier.TYPE.SUCCESS);

					submit.setAttribute("style", "visibility: hidden");
				} else {
					notifier.notify(i18n.trans("error"), notifier.TYPE.ERROR);
				}
			})
			.catch(() => {
				notifier.notify(i18n.trans("error"), notifier.TYPE.ERROR);
			});

		submit.disabled = false;
	};

	/**
	 * Create an event listener to the form submission.
	 */
	form.addEventListener("submit", listener, false);
});
