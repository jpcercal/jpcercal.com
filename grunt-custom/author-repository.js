module.exports = function (grunt) {
    'use strict';

    var authors = grunt.file.readYAML('data/authors.yml');

    var AuthorRepository = function () {
        var findAll = function () {
            return authors;
        };

        var findBySlug = function (slug) {
            return authors.filter(function (author) {
                return author.slug === slug;
            });
        };

        var findByEmail = function (email) {
            if (typeof authors[email] === 'undefined') {
                return null;
            }

            return authors[email];
        };

        return {
            findAll: findAll,
            findBySlug: findBySlug,
            findByEmail: findByEmail
        };
    };

    return new AuthorRepository();
};
