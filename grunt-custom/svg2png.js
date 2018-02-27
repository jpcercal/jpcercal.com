module.exports = function (grunt) {
    'use strict';

    var sprintf = require('sprintf-js').sprintf;
    var fs      = require("pn/fs");
    var svg2png = require('svg2png');

    var postRepository = require('./post-repository')(grunt);

    var task = {
        name: "svg2png",
        description: "Converts SVG to PNG files"
    };

    grunt.registerTask(task.name, task.description, function () {
        var width  = grunt.config.get(sprintf('%s.options.width', task.name));
        var height = grunt.config.get(sprintf('%s.options.height', task.name));

        var postsPath = postRepository.findAll().map(function (post) {
            return sprintf(
                '%s/public/%s%s/index', 
                process.cwd(), 
                post.language == 'en' ? 'en/' : '',
                post.slug
            );
        });

        var options = {
            width:  typeof width  === 'undefined' ? 512 : width,
            height: typeof height === 'undefined' ? 512 : height
        };

        var writeFileCallback = function(err) {
            grunt.fail.fatal(err);
        };

        grunt.log.writeln('Preparing to convert SVG to PNG files for each post.');

        grunt.log.writeln(sprintf('> Options: {height: %d, width: %d}', options.height, options.width));

        for (var i = 0; i < postsPath.length; i++) {
            var inputFilename  = sprintf('%s.svg', postsPath[i]);
            var outputFilename = sprintf('%s.png', postsPath[i]);

            grunt.log.writeln(sprintf('> Processing "%s".', inputFilename));

            var sourceBuffer = fs.readFileSync(inputFilename);
            var outputBuffer = svg2png.sync(sourceBuffer, options);

            fs.writeFileSync(outputFilename, outputBuffer, 'utf-8', writeFileCallback);
        }

        grunt.log.ok(sprintf('Done. It was generated an index containing "%d" posts.', postsPath.length));
    });
};
