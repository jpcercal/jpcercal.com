module.exports = function (grunt) {
    'use strict';

    var fs = require('fs');
    var spawnSync = require('child_process').spawnSync;
    var sprintf = require('sprintf-js').sprintf;

    var postRepository = require('./post-repository')(grunt);

    var task = {
        name: "svg2png",
        description: "Converts SVG to PNG files"
    };
    
    grunt.registerTask(task.name, task.description, function () {
        var posts = postRepository.findAll();

        var width  = grunt.config.get(sprintf('%s.options.width', task.name));
        var height = grunt.config.get(sprintf('%s.options.height', task.name));

        if (typeof width === 'undefined') {
            width = 512;
        }

        if (typeof height === 'undefined') {
            height = 512;
        }

        grunt.log.writeln('Preparing to convert SVG to PNG files for each post.');
        grunt.log.writeln(sprintf('> Options: {height: %d, width: %d}', height, width));

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

            spawnSync('inkscape', [
                '--export-type=png',
                sprintf('--export-width=%d',  width),
                sprintf('--export-height=%d', height),
                inputFilename
            ]);
    
            if (!fs.existsSync(outputFilename)) {
                grunt.fail.fatal(sprintf('! Filename "%s" could not be created.', outputFilename));    
            }
        }

        grunt.log.ok(sprintf('Done. It was generated an index containing "%d" posts.', posts.length));
    });
};
