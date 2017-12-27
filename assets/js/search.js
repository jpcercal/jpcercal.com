document.addEventListener('DOMContentLoaded', function() {
    var config = {
        timer: null, // Store the timer
        delay: 750,  // Delay in ms to start processing the operation
        minChars: 3  // Minimum quantity of characters that the user must input to perform the operation
    };

    var lunrIndex;   // Store the Lunr index where the results will be compared with the term
    var template;    // Store the template that will be parsed
    var source;      // Store the data that will be be used to search for a term

    /**
     * Input field where the user will put the terms that he wants search for.
     *
     * @type {Element}
     */
    var inputField = document.querySelector("#search");

    /**
     * Element that will contains all results (as know as container).
     *
     * @type {Element}
     */
    var searchResults = document.querySelector("#search-results");

    /**
     * Internationalization keys and translations for each locale.
     *
     * @type {{trans}}
     */
    var i18n = (function () {
        var translations = {
            'createdBy': {
                'pt': 'por',
                'en': 'by'
            },
            'noResults': {
                'pt': 'Nenhum resultado encontrado',
                'en': 'No results found'
            }
        };

        return {
            trans: function (key) {
                return translations[key][window.locale];
            }
        };
    })();

    /**
     * Create and configure the Lunr Index.
     *
     * @retuns {lunr.Index}
     */
    var createLunrIndex = function () {
        return lunr(function () {
            this.field("title", {
                boost: 50
            });

            this.field("description", {
                boost: 25
            });

            this.field("categoryTitle", {
                boost: 20
            });

            this.field("tags", {
                boost: 15
            });

            this.field("content", {
                boost: 10
            });

            this.field("author", {
                boost: 5
            });

            this.field("language", {
                boost: 2
            });

            this.ref("id");

            source.forEach(function (doc) {
                this.add(doc);
            }, this);
        });
    };

    /**
     * Search in the whole collection if there is a match with the current term.
     *
     * @param term
     * @returns {Array}
     */
    var search = function (term) {
        var suggestions = [];

        lunrIndex.search('*' + term + '*').map(function(result) {
            source.filter(function (current) {
                if (current.id == result.ref) {
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
    var renderHtml = function (suggestion) {
        var baseUrl = window.baseUrl + (suggestion.language == 'en' ? 'en/' : '');

        var authorPrefix = i18n.trans('createdBy');

        return template
            .split('__ID__').join(suggestion.id)
            .split('__TITLE__').join(suggestion.title)
            .split('__AUTHOR__').join(authorPrefix + ' ' + suggestion.author)
            .split('__DESCRIPTION__').join(suggestion.description)
            .split('__LANGUAGE__').join(suggestion.language)
            .split('__TAGS__').join(suggestion.tags.join(', '))
            .split('__IMAGE__').join(baseUrl + suggestion.image)
            .split('__CATEGORYURL__').join(baseUrl + 'categories/' + suggestion.categoryUrl)
            .split('__CATEGORYTITLE__').join(suggestion.categoryTitle)
            .split('__CONTENT__').join(suggestion.content)
            .split('__HREF__').join(baseUrl + suggestion.slug)
        ;
    };

    /**
     * Event Listener.
     *
     * @param event
     */
    var listener = function (event) {
        event.preventDefault();

        var term = inputField.value;

        if (config.timer != null) {
            clearTimeout(config.timer);
        }

        config.timer = setTimeout(function() {
            if (term.length >= config.minChars) {
                var suggestions = search(term);
                var html = '';

                searchResults.innerHTML = html;

                if (suggestions.length === 0) {
                    html = '<p>“' + i18n.trans('noResults') + '.”</p>';
                } else {
                    for (var i = 0; i < suggestions.length; i++) {
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
    var process = function (searchTemplate, searchData) {
        template  = searchTemplate.data.trim();
        source    = searchData.data;

        lunrIndex = createLunrIndex();

        inputField.addEventListener('keyup', listener);
        inputField.addEventListener('input', listener);
    };

    /**
     * Load dependencies.
     */
    var promises = axios.all([
        axios.get(window.baseUrl + 'search-template.html'),
        axios.get(window.baseUrl + 'search.json')
    ]);

    /**
     * Start processing.
     */
    promises.then(axios.spread(process));
});
