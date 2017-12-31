module.exports = function (grunt) {
    'use strict';

    var sprintf = require('sprintf-js').sprintf;

    var postRepository = require('./post-repository')(grunt);
    var authorRepository = require('./author-repository')(grunt);
    var categoryRepository = require('./category-repository')(grunt);
    var tagRepository = require('./tag-repository')(grunt);

    var posts = postRepository.findAll().filter(function (post) {
        return post.draft === false;
    });

    var authors = authorRepository.findAll();
    var categories = categoryRepository.findAll();
    var tags = tagRepository.findAll();

    var postsPath = posts.map(function (post) {
         return sprintf('/%s/', post.slug);
    });

    var authorsPath = ['/authors/'];

    for (var email in authors) {
        authorsPath.push(sprintf('/authors/%s/', authors[email].slug));
    }

    var categoriesPath = ['/categories/'];

    for (var category in categories) {
        categoriesPath.push(sprintf('/categories/%s/', category));
    }

    var tagsPath = ['/tags/'];

    for (var tag in tags) {
        tagsPath.push(sprintf('/tags/%s/', tag));
    }

    var paths = [
        '/',
        '/contact/',
        '/search/',
        '/page/1/',
        '/404/'
    ];

    paths = paths
        .concat(postsPath)
        .concat(authorsPath)
        .concat(categoriesPath)
        .concat(tagsPath)
    ;

    return {
        paths: paths
    };
};
