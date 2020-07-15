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

        var options = {
            width:  typeof width  === 'undefined' ? 512 : width,
            height: typeof height === 'undefined' ? 512 : height
        };

        var writeFileCallback = function(err) {
            grunt.fail.fatal(err);
        };

        grunt.log.writeln('Preparing to convert SVG to PNG files for each post.');

        grunt.log.writeln(sprintf('> Options: {height: %d, width: %d}', options.height, options.width));

        var posts = postRepository.findAll();

        for (var i = 0; i < posts.length; i++) {
            var filenameTemplate = sprintf(
                '%s/public/%s%s/index',
                process.cwd(),
                posts[i].language == 'en' ? 'en/' : '',
                posts[i].slug
            );

            var inputFilename = sprintf("%s.svg", filenameTemplate);
            var outputFilename = sprintf("%s.png", filenameTemplate);

            grunt.verbose.writeln(sprintf('> Reading "%s".', inputFilename));
            grunt.log.writeln(sprintf('> Generating "%s".', outputFilename));

            var sourceBuffer = fs.readFileSync(inputFilename);
            var outputBuffer = svg2png.sync(sourceBuffer, options);

            fs.writeFileSync(outputFilename, outputBuffer, 'utf-8', writeFileCallback);
        }

        grunt.log.ok(sprintf('Done. It was generated an index containing "%d" posts.', posts.length));
    });
};
