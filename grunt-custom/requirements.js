module.exports = function (grunt) {
    'use strict';

    var sprintf = require('sprintf-js').sprintf;

    var abortAndDisplayAnError = function (environmentVariable, exampleValue) {
        grunt.log.errorlns(sprintf('You must set the environment variable "%s" before.', environmentVariable));
        grunt.log.writeln('As an example for development environment you can set it just running this command:');
        grunt.log.oklns(sprintf('export %s=%s', environmentVariable, exampleValue));

        grunt.fail.fatal(sprintf('Environment variable "%s" not found.', environmentVariable));
    };

    var envIsDefined = function (env) {
        return typeof process.env[env] !== 'undefined';
    };

    var currentTaskIsPageSpeed = function () {
        return grunt.cli.tasks.indexOf('pagespeed') === 0;
    };

    if (!currentTaskIsPageSpeed() && !envIsDefined('BASE_URL')) {
        abortAndDisplayAnError('BASE_URL', 'https://cercal.io/');
    }

    if (currentTaskIsPageSpeed() && !envIsDefined('GOOGLE_API_KEY')) {
        abortAndDisplayAnError('GOOGLE_API_KEY', '<your-google-api-key>');
    }
};
