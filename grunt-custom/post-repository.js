module.exports = function (grunt) {
    'use strict';

    var yaml    = require("js-yaml");
    var S       = require("string");
    var sprintf = require('sprintf-js').sprintf;

    var contentDir = grunt.file.readYAML('config.yaml').contentDir + '/posts';

    var PostRepository = function () {
        var findAll = function () {
            var posts = [];

            grunt.log.writeln(sprintf('Reading files from "./%s/"...', contentDir));

            grunt.file.recurse(contentDir, function (abspath, rootdir, subdir, filename) {
                if (S(filename).endsWith(".md")) {
                    var frontMatter = findByAbsolutePath(abspath, filename);

                    if (frontMatter != null) {
                        posts.push(frontMatter);
                    }
                }
            });

            return posts;
        };

        var findByAbsolutePath = function (abspath, filename) {
            grunt.verbose.ok(sprintf('Reading "%s" ...', abspath));

            var content = grunt.file.read(abspath);
            var language = S(filename).endsWith('.en.md') ? 'en' : 'pt';

            // First separate the Front Matter from the content and parse it
            content = content.split("---");

            var frontMatter = null;

            try {
                frontMatter = yaml.safeLoad(content[1].trim());
                frontMatter.content = content[2];
                frontMatter.language = language;
            } catch (e) {
                grunt.log.error(e.message);
            }

            return frontMatter;
        };

        return {
            findAll: findAll,
            findByAbsolutePath: findByAbsolutePath
        };
    };

    return new PostRepository();
};
