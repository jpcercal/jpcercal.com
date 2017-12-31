module.exports = function (grunt) {
    'use strict';

    var md5     = require('md5');
    var S       = require("string");
    var sprintf = require('sprintf-js').sprintf;

    var postRepository = require('./post-repository')(grunt);

    var task = {
        name: "lunr",
        description: "Generates the Lunr indexes according to the posts of this blog"
    };

    grunt.registerTask(task.name, task.description, function (env) {
        var config = sprintf('%s.%s.buildDraft', task.name, env);

        grunt.config.requires(config);

        var buildDraft = grunt.config.get(config);
        var authors    = grunt.file.readYAML('data/authors.yml');
        var categories = grunt.file.readYAML('data/categories.yml');

        var pages = [];

        var resolvePost = function (post) {
            // Build Lunr index for this search
            grunt.log.writeln(sprintf('> Processing "%s".', post.slug));

            var image = sprintf('%s/index.svg', post.slug);

            if (!grunt.file.exists('content/posts/' + image)) {
                image = 'images/icons/tag.svg';
            }

            return {
                id: md5(post.title + post.language + post.description),
                title: post.title,
                slug: post.slug,
                author: authors[post.author].name,
                description: post.description,
                language: post.language,
                tags: post.tags,
                image: image,
                categoryUrl: post.categories[0],
                categoryTitle: categories[post.categories[0]].title[post.language],
                content: S(post.content).trim().stripTags().stripPunctuation().s
            };
        };

        grunt.log.writeln("Preparing to build the search index.");

        postRepository.findAll().filter(function (post) {
            if (buildDraft == true || post.draft == false) {
                pages.push(resolvePost(post));
            }
        });

        grunt.file.write('public/search.json', JSON.stringify(pages));

        grunt.log.ok(sprintf('Done. It was generated an index containing "%d" posts.', pages.length));
    });
};
