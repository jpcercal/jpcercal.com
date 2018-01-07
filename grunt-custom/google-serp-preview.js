module.exports = function (grunt) {
    'use strict';

    var sprintf    = require('sprintf-js').sprintf;
    var handlebars = require('handlebars');
    var cssSelect  = require("css-select");
    var domutils   = require("domutils");
    var parseDOM   = require("htmlparser2").parseDOM;
    var array_dups = require('array-duplicates-properties');
    var Entities   = require('html-entities').AllHtmlEntities;

    var task = {
        name: "google-serp-preview",
        description: "Generates the results in a similar way that will be showed on Google Search Engine Results Page"
    };

    grunt.registerTask(task.name, task.description, function () {
        var config = {
            paths:    sprintf('%s.options.paths',    task.name),
            template: sprintf('%s.options.template', task.name)
        };

        grunt.config.requires(config.paths);
        grunt.config.requires(config.template);

        var paths      = grunt.config.get(config.paths);
        var template   = grunt.config.get(config.template);
        var hugoConfig = grunt.file.readYAML('config.yaml');
        var results    = [];

        var Serp = function (path) {
            var filename = sprintf('public%s', path.indexOf('404') >= 0 ? '/404.html' : path + 'index.html');

            var html       = grunt.file.read(filename);
            var siteTitle  = hugoConfig.languages.en.title;
            var titleSep   = ' | ';

            var getTitle = function () {
                return domutils.getText(cssSelect.selectOne('title', parseDOM(html)));
            };

            var getDescription = function () {
                return domutils.getAttributeValue(cssSelect.selectOne('meta[name="description"]', parseDOM(html)), 'content');
            };

            var getUrl = function () {
                return domutils.getAttributeValue(cssSelect.selectOne('link[rel="canonical"]', parseDOM(html)), 'href');
            };

            return {
                getData: function () {
                    var entities = new Entities();
                    var title = entities.decode(getTitle());
                    var url = entities.decode(getUrl());
                    var description = entities.decode(getDescription());

                    if (title.length === 0) {
                        throw new Error(sprintf('Path: "%s", the title is a mandatory tag.', path));
                    }

                    if ((title.length - (siteTitle.length + titleSep.length)) > 60) {
                        throw new Error(sprintf('Path: "%s", the title is too long.', path));
                    }

                    if (description.length === 0) {
                        throw new Error(sprintf('Path: "%s", the meta description is a mandatory tag.', path));
                    }

                    if (description.length > 300) {
                        throw new Error(sprintf('Path: "%s", the meta description is too long.', path));
                    }

                    if (url.length === 0) {
                        throw new Error(sprintf('Path: "%s", the link canonical is a mandatory tag.', path));
                    }

                    return {
                        path: path,
                        title: title,
                        url: url,
                        description: description
                    };
                }
            };
        };

        var checkPageWithSameInformation = function (data) {
            var title       = array_dups.findObjectsOfSharedProperties(data, ['title']);
            var url         = array_dups.findObjectsOfSharedProperties(data, ['url']);
            var description = array_dups.findObjectsOfSharedProperties(data, ['description']);

            var createError = function (duplication) {
                var message = 'Found duplicated content. ';

                for (var i = 0; i < duplication[0].indexes.length; i++) {
                    var current = data[duplication[0].indexes[i]];

                    if (i == 0) {
                        var match = duplication[0].matches[0];
                        message += sprintf('["%s": "%s"] is duplicated for the following paths:\n', match.element, match.val);
                    }

                    message += sprintf('  => "%s"\n', current.path);
                }

                return Error(message);
            };

            if (title.length > 0) {
                throw createError(title);
            }

            if (url.length > 0) {
                throw createError(url);
            }

            if (description.length > 0) {
                throw createError(description);
            }
        };

        for (var i = 0; i < paths.length; i++) {
            var currentPath = paths[i];

            try {
                var currentData = new Serp(currentPath).getData();

                results.push(currentData);
            } catch (e) {
                grunt.log.error(e.message);
            }
        }

        try {
            checkPageWithSameInformation(results);
        } catch (e) {
            grunt.log.error(e.message);
        }

        grunt.file.write('public/google.html', handlebars.compile(template)({
            results: results
        }));

        grunt.log.ok(sprintf(
            'Done. It was generated a preview containing "%d" results of "%d" paths.',
            results.length,
            paths.length
        ));
    });
};
