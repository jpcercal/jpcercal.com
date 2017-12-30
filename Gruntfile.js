module.exports = function (grunt) {
    'use strict';

    if (typeof process.env.BASE_URL === 'undefined') {
        grunt.log.errorlns('You must set the environment variable "BASE_URL" before.');
        grunt.log.writeln('As an example for development environment you can set it just running this command:');
        grunt.log.oklns('export BASE_URL=https://cercal.dev/');

        return;
    }

    require('load-grunt-config')(grunt, {
        init: true,
        data: {
            baseUrl:         process.env.BASE_URL,
            license:         grunt.file.read('LICENSE'),
            banner:          "/*\n<%= license %>*/\n",

            bower_path:      "vendor",
            dist_path:       "public",
            src_path:        "assets",

            js_path:         "js",
            css_path:        "css",
            img_path:        "images",
            author_path:     "content/authors",
            content_path:    "content/posts",

            dist_js_path:    "<%= dist_path %>/<%= js_path %>",
            dist_css_path:   "<%= dist_path %>/<%= css_path %>",
            dist_img_path:   "<%= dist_path %>/<%= img_path %>",
            dist_author_path:"<%= dist_path %>/authors",

            src_app_path:    "<%= src_path %>",
            src_less_path:   "<%= src_app_path %>/less",
            src_scss_path:   "<%= src_app_path %>/scss"
        }
    });

    require('time-grunt')(grunt);
    require('./lunr')(grunt);
};