axios.all([
    axios.get(window.baseUrl + 'search-template.html'),
    axios.get(window.baseUrl + 'search.json')
]).then(axios.spread(function (template, source) {
    var inputField = document.querySelector("#search");
    var searchResults = document.querySelector("#search-results");
    var minCharactersToPerformOperation = 3;
    var delay = 750; // in microseconds
    var timer;

    var lunrIndex = lunr(function () {
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

        source.data.forEach(function (doc) {
            this.add(doc);
        }, this);
    });

    var search = function (term) {
        var suggestions = [];

        lunrIndex.search('*' + term + '*').map(function(result) {
            source.data.filter(function (current) {
                if (current.id == result.ref) {
                    suggestions.push(current);
                }
            });
        });

        return suggestions;
    };

    var listener = function (event) {
        var term = inputField.value;

        clearTimeout(timer);

        timer = setTimeout(function() {
            if (term.length >= minCharactersToPerformOperation) {
                var suggestions = search(term);

                var html = '';

                searchResults.innerHTML = '';

                if (suggestions.length === 0) {
                    var message = window.locale == 'pt' ? 'Nenhum resultado encontrado' : 'No results found';
                    html = '<p>“' + message + '.”</p>';
                } else {
                    for (var i = 0; i < suggestions.length; i++) {
                        var suggestion = suggestions[i];

                        var baseUrl = window.baseUrl + (suggestion.language == 'en' ? 'en/' : '');

                        var authorPrefix = window.locale == 'pt' ? 'por' : 'by';

                        html += template.data.trim()
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
                    }
                }

                searchResults.innerHTML = html;
            }
        }, delay);
    };

    inputField.addEventListener('keyup', listener);
    inputField.addEventListener('input', listener);
})).catch(function (error) {
    console.error(error);
});
