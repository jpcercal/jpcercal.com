/**
 * Shared internationalization helper.
 *
 * Each page defines its own translation keys; the locale comes from the
 * Hugo build (js.Build params), replacing the old window.locale global.
 */
export const createTranslator = (translations, locale) => ({
	trans: (key) => translations[key][locale],
});
