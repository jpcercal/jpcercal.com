module.exports = function (grunt) {
    'use strict';

    var yaml    = require("js-yaml");
    var md5     = require('md5');
    var S       = require("string");
    var sprintf = require('sprintf-js').sprintf;

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
        var contentDir = grunt.file.readYAML('config.yaml').contentDir + '/posts';

        var pages = [];

        var getFrontMatter = function (abspath, filename) {
            grunt.verbose.ok(sprintf('Reading "%s" ...', abspath));

            var content = grunt.file.read(abspath);

            // First separate the Front Matter from the content and parse it
            content = content.split("---");

            var frontMatter = null;

            try {
                frontMatter = yaml.safeLoad(content[1].trim());
                frontMatter.content = content[2];
            } catch (e) {
                grunt.log.error(e.message);
            }

            return frontMatter;
        };

        var processMDFile = function (frontMatter, filename) {
            // Build Lunr index for this search
            grunt.log.writeln(sprintf('> Processing "%s/%s".', frontMatter.slug, S(filename).trim()));

            var language = S(filename).endsWith('.en.md') ? 'en' : 'pt';

            var image = sprintf('%s/index.svg', frontMatter.slug);

            if (!grunt.file.exists('content/posts/' + image)) {
                image = 'images/icons/tag.svg';
            }

            return {
                id: md5(frontMatter.title + frontMatter.language + frontMatter.description),
                title: frontMatter.title,
                slug: frontMatter.slug,
                author: authors[frontMatter.author].name,
                description: frontMatter.description,
                language: language,
                tags: frontMatter.tags,
                image: image,
                categoryUrl: frontMatter.categories[0],
                categoryTitle: categories[frontMatter.categories[0]].title[language],
                content: S(frontMatter.content).trim().stripTags().stripPunctuation().s
            };
        };

        grunt.log.writeln("Preparing to build the search index.");
        grunt.log.writeln(sprintf('Reading files from "./%s/"...', contentDir));

        grunt.file.recurse(contentDir, function (abspath, rootdir, subdir, filename) {
            if (S(filename).endsWith(".md")) {
                var frontMatter = getFrontMatter(abspath, filename);

                if (frontMatter != null) {
                    if (buildDraft == true || frontMatter.draft == false) {
                        pages.push(processMDFile(frontMatter, filename));
                    }
                }
            }
        });

        grunt.file.write('public/search.json', JSON.stringify(pages));

        grunt.log.ok(sprintf('Done. It was generated an index containing "%d" posts.', pages.length));
    });
};
