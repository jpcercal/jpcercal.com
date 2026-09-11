import * as params from "@params";
import { createTranslator } from "./i18n.js";
import { createNotifier } from "./notifier.js";

document.addEventListener("DOMContentLoaded", () => {
	const form = document.querySelector("#contact-form");
	const email = document.querySelector("#email");
	const name = document.querySelector("#name");
	const message = document.querySelector("#message");
	const submit = document.querySelector("#send");
	const notification = document.querySelector("#notification-container");

	/**
	 * Internationalization keys and translations for each locale.
	 *
	 * @type {{trans}}
	 */
	const i18n = createTranslator(
		{
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
		},
		params.locale,
	);

	/**
	 * Notify the customer with a message.
	 *
	 * @type {{TYPE, notify}}
	 */
	const notifier = createNotifier(notification);

	/**
	 * Validation component to validate simple data that comes from the user.
	 *
	 * @type {{isValid}}
	 */
	const validator = (() => {
		const isValidEmail = (email) => {
			const regex =
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			return regex.test(email.toLowerCase());
		};

		const isMissing = (name, email, message) => {
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

		const isValid = (name, email, message) => {
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

	const userInfo = (() => {
		let ip = "";

		fetch("//api.ipify.org?format=json")
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				}

				return null;
			})
			.then((data) => {
				if (data) {
					ip = data.ip;
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
	const listener = (event) => {
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

		const cc = ["jpcercal@gmail.com"];

		const formParams = new URLSearchParams();
		formParams.append("_cc", cc.join(","));
		formParams.append("_subject", `[via @jpcercal.com] ${name.value}`);
		formParams.append("email", email.value);
		formParams.append("name", name.value);
		formParams.append("message", message.value);
		formParams.append("ip", userInfo.getIp());

		fetch("//formspree.io/contact@jpcercal.com", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: formParams,
		})
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
