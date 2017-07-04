axios.all([
    axios.get(window.baseUrl + 'search.html'),
    axios.get(window.baseUrl + 'search.json')
]).then(axios.spread(function (template, source) {
    var lunrIndex;

    new autoComplete({
        selector: '#search',
        minChars: 2,
        delay: 500,
        source: function(term, suggest) {
            lunrIndex = lunr(function () {
                this.field("title", {
                    boost: 10
                });
    
                this.field("description", {
                    boost: 10
                });

                this.field("topics", {
                    boost: 5
                });

                this.field("tags", {
                    boost: 5
                });

                this.field("content");

                this.field("language");

                this.field("slug");

                this.ref("id");

                source.data.forEach(function (doc) {
                    this.add(doc);
                }, this);
            });

            var suggestions = [];

            lunrIndex.search(term + '*').map(function(result) {
                source.data.filter(function (current) {
                    if (current.id == result.ref) {
                        suggestions.push(current);
                    }
                });
            });

            suggest(suggestions);
        },
        renderItem: function (item, search) {
            return template.data.trim()
                .replace('__ID__', item.id)
                .replace('__SLUG__', item.slug)
                .replace('__TITLE__', item.title)
                .replace('__LANGUAGE__', item.language)
                .replace('__DESCRIPTION__', item.description)
                .replace('__TOPICS__', item.topics)
                .replace('__TAGS__', item.tags)
                .replace('__HREF__', window.baseUrl + (item.language == 'en' ? 'en' : '') + item.slug)
            ;
        },
        onSelect: function(event, term, item) {
            window.location.href = item.getAttribute('data-href');
        }
    });

})).catch(function (error) {
    console.log(error);
});
