module.exports = function (grunt) {
    'use strict';

    var sprintf = require('sprintf-js').sprintf;

    var abortAndDisplayAnError = function (environmentVariable, exampleValue) {
        grunt.log.errorlns(sprintf('You must set the environment variable "%s" before.', environmentVariable));
        grunt.log.writeln('As an example for development environment you can set it just running this command:');
        grunt.log.oklns(sprintf('export %s=%s', environmentVariable, exampleValue));

        grunt.fail.fatal(sprintf('Environment variable "%s" not found.', environmentVariable));
    };

    if (typeof process.env.BASE_URL === 'undefined') {
        abortAndDisplayAnError('BASE_URL', 'https://cercal.io/');
    }

    if (grunt.cli.tasks.indexOf('pagespeed') === 0 && typeof process.env.GOOGLE_API_KEY === 'undefined') {
        abortAndDisplayAnError('GOOGLE_API_KEY', '<your-google-api-key>');
    }
};
