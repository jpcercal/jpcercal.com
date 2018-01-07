module.exports = function (grunt) {
    'use strict';

    require('time-grunt')(grunt);
    require('./grunt-custom/requirements')(grunt);
    require('./grunt-custom/lunr')(grunt);
    require('./grunt-custom/google-serp-preview')(grunt);

    var paths = require('./grunt-custom/paths')(grunt);

    require('load-grunt-config')(grunt, {
        init: true,
        data: {
            baseUrl:         process.env.BASE_URL,
            googleApiKey:    process.env.GOOGLE_API_KEY,
            license:         grunt.file.read('LICENSE'),
            banner:          "/*\n<%= license %>*/\n",

            paths:           paths,

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
};