module.exports = function (grunt) {
    'use strict';

    var tags = grunt.file.readYAML('data/tags.yml');

    var TagRepository = function () {
        var findAll = function () {
            return tags;
        };

        var findBySlug = function (slug) {
            if (typeof tags[slug] === 'undefined') {
                return null;
            }

            return tags[slug];
        };

        return {
            findAll: findAll,
            findBySlug: findBySlug
        };
    };

    return new TagRepository();
};
