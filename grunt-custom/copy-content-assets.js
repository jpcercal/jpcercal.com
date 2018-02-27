module.exports = function (grunt) {
    'use strict';

    var md5 = require('md5');
    var S = require("string");
    var sprintf = require('sprintf-js').sprintf;

    var postRepository = require('./post-repository')(grunt);

    var task = {
        name: "copy-content-assets",
        description: "Copy assets to dist path according to the language of each post"
    };

    grunt.registerTask(task.name, task.description, function () {
        var sourcePathKey = sprintf('%s.%s.sourcePath', task.name, 'dist');
        var destinationPathKey = sprintf('%s.%s.destinationPath', task.name, 'dist');
        var fileExtensionsKey = sprintf('%s.%s.fileExtensions', task.name, 'dist');

        grunt.config.requires(sourcePathKey);
        grunt.config.requires(destinationPathKey);
        grunt.config.requires(fileExtensionsKey);

        var sourcePath = grunt.config.get(sourcePathKey);
        var destinationPath = grunt.config.get(destinationPathKey);
        var fileExtensions = grunt.config.get(fileExtensionsKey);

        var specs = {
            filter: 'isFile',
            cwd: sourcePath
        };

        var copiedFiles = 0;

        var postsPath = postRepository.findAll().map(function (post) {
            var source = post.slug + sprintf('/*.{%s}', fileExtensions.join(','));

            var contentDestination = sprintf('%s%s/', post.language == 'en' ? 'en/' : '', post.slug);

            grunt.file.expand(specs, [source]).forEach(function (src) {
                var filename = src.split('/').pop();
                var dest = destinationPath + contentDestination + filename;

                grunt.verbose.ok(sprintf('source: %s', src));
                grunt.verbose.ok(sprintf('dest:   %s', dest));
                
                grunt.file.copy(sourcePath + src, dest);
                
                ++copiedFiles;
            });
        });

        grunt.log.ok(sprintf(
            'Done. It was processed "%d" posts and copied "%d" files.', 
            postsPath.length, 
            copiedFiles
        ));
    });
};
