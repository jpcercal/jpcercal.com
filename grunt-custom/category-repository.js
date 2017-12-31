module.exports = function (grunt) {
    'use strict';

    var categories = grunt.file.readYAML('data/categories.yml');

    var CategoryRepository = function () {
        var findAll = function () {
            return categories;
        };

        var findBySlug = function (slug) {
            if (typeof categories[slug] === 'undefined') {
                return null;
            }

            return categories[slug];
        };

        return {
            findAll: findAll,
            findBySlug: findBySlug
        };
    };

    return new CategoryRepository();
};
