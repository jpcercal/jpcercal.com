module.exports = function (grunt) {
    'use strict';

    require('time-grunt')(grunt);

    var yaml = require("js-yaml");
    var md5  = require('md5');
    var S    = require("string");

    var EnvironmentVariable = {
        has: function (key) {
            return typeof process.env[key] !== 'undefined';
        },
        get: function (key) {
            return process.env[key];
        }
    };

    var baseUrl = function (defaultValue) {
        return EnvironmentVariable.has('BASE_URL') ? EnvironmentVariable.get('BASE_URL') : defaultValue;
    };

    var shouldBuildDraft = function () {
        if (EnvironmentVariable.has('BUILD_DRAFT')) {
            var value = EnvironmentVariable.get('BUILD_DRAFT');

            switch (value.toLowerCase()) {
                case '1':
                case 'yes':
                case 'y':
                case 'on':
                    return true;
            }
        }

        return false;
    };

    grunt.initConfig({

        pkg:             grunt.file.readJSON('package.json'),
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
        src_scss_path:   "<%= src_app_path %>/scss",

        jshint: {
            files: [
                'Gruntfile.js',
                '<%= src_app_path %>/<%= js_path %>/*.js'
            ],
            options: {
                globals: {
                    console: true
                }
            }
        },

        csslint: {
            dist: {
                src: '<%= dist_css_path %>/<%= pkg.name %>.css'
            },
            syntax: {
                src: '<%= dist_css_path %>/syntax-highlight.css'
            },
            options: {
                csslintrc: ".csslintrc"
            }
        },

        htmllint: {
            dist: {
                options: {
                    ignore: [
                        /This document appears to be written in \w+ but the “\w+” start tag has “\w+="\w+"”\. Consider using “\w+="\w+"” \(or variant\) instead\./
                    ]
                },
                src: [
                    '<%= dist_path %>/**/*.html',
                    '!<%= dist_path %>/search-template.html'
                ]
            }
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= dist_path %>/**/*'
                    ]
                }]
            },
            unminified: {
                files: [{
                    dot: true,
                    src: [
                        '<%= dist_css_path %>/<%= pkg.name %>.css',
                        '<%= dist_css_path %>/<%= pkg.name %>.css.map',
                        '<%= dist_css_path %>/syntax-highlight.css',
                        '<%= dist_css_path %>/syntax-highlight.css.map',
                        '<%= dist_css_path %>/vendor.css',
                        '<%= dist_css_path %>/vendor.css.map',
                    ].concat('<%= concat.js.dest %>').concat('<%= concat.search.dest %>').concat('<%= concat.contact.dest %>')
                }]
            }
        },

        copy: {
            production: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= src_app_path %>/<%= img_path %>/',
                        src: ['**/*.{png,jpg,jpeg,gif,svg}'],
                        dest: '<%= dist_img_path %>/'
                    },
                    {
                        expand: true,
                        cwd: '<%= content_path %>/',
                        src: ['**/*.{png,jpg,jpeg,gif,svg}'],
                        dest: '<%= dist_path %>/'
                    },
                    {
                        expand: true,
                        cwd: '<%= author_path %>/',
                        src: ['**/*.{png,jpg,jpeg,gif,svg,pdf}'],
                        dest: '<%= dist_author_path %>/'
                    }
                ]
            },
            development: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= src_app_path %>/<%= img_path %>/',
                        src: ['**/*.{png,jpg,jpeg,gif,svg}'],
                        dest: '<%= dist_img_path %>/'
                    },
                    {
                        expand: true,
                        cwd: '<%= content_path %>/',
                        src: ['**/*.{png,jpg,jpeg,gif,svg}'],
                        dest: '<%= dist_path %>/'
                    },
                    {
                        expand: true,
                        cwd: '<%= author_path %>/',
                        src: ['**/*.{png,jpg,jpeg,gif,svg,pdf}'],
                        dest: '<%= dist_author_path %>/'
                    },
                    {
                        src: 'node_modules/lunr/lunr.js',
                        dest: '<%= dist_path %>/vendor/js/lunr.js'
                    },
                    {
                        src: 'node_modules/axios/dist/axios.js',
                        dest: '<%= dist_path %>/vendor/js/axios.js'
                    }
                ]
            }
        },

        imagemin: {
            production: {
                files: '<%= copy.production.files %>'
            }
        },

        concat: {
            options: {
                banner: '<%= banner %>'
            },
            js: {
                src: [
                    '<%= src_app_path %>/<%= js_path %>/<%= pkg.name %>.js'
                ],
                dest: '<%= dist_js_path %>/<%= pkg.name %>.js'
            },
            search: {
                src: [
                    '<%= src_app_path %>/<%= js_path %>/search.js'
                ],
                dest: '<%= dist_js_path %>/<%= pkg.name %>.search.js'
            },
            contact: {
                src: [
                    '<%= src_app_path %>/<%= js_path %>/contact.js'
                ],
                dest: '<%= dist_js_path %>/<%= pkg.name %>.contact.js'
            }
        },

        less: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    '<%= dist_css_path %>/syntax-highlight.css': '<%= src_less_path %>/<%= pkg.name %>.less'
                }
            }
        },

        sass: {
            dist: {
                files: {
                    '<%= dist_css_path %>/vendor.css': '<%= src_scss_path %>/vendor.scss',
                    '<%= dist_css_path %>/<%= pkg.name %>.css': '<%= src_scss_path %>/<%= pkg.name %>.scss'
                }
            }
        },

        processhtml: {
            development: {
                options: {
                    process: true
                },
                files: [{
                    expand: true,     
                    cwd: 'public/',   
                    src: ['**/*.html'],
                    dest: 'public/',  
                    ext: '.html'
                }]
            },
            production: {
                options: {
                    process: true
                },
                files: [{
                    expand: true,     
                    cwd: 'public/',   
                    src: ['**/*.html'],
                    dest: 'public/',  
                    ext: '.html'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= dist_path %>/',
                        src: ['**/*.html'],
                        dest: '<%= dist_path %>/'
                    }
                ]
            }
        },

        xmlmin: {
            dist: {
                options: {
                    preserveComments: false
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= dist_path %>/',
                        src: ['**/*.{xml,svg}'],
                        dest: '<%= dist_path %>/'
                    }
                ]
            }
        },

        cssmin: {
            dist: {
                files: {
                    '<%= dist_css_path %>/<%= pkg.name %>.min.css': [
                        '<%= dist_css_path %>/<%= pkg.name %>.css',
                    ],
                    '<%= dist_css_path %>/vendor.min.css': [
                        '<%= dist_css_path %>/vendor.css',
                    ],
                    '<%= dist_css_path %>/syntax-highlight.min.css': [
                        '<%= dist_css_path %>/syntax-highlight.css',
                    ]
                }
            }
        },

        uglify: {
            js: {
                files: {
                    '<%= dist_js_path %>/<%= pkg.name %>.min.js': [
                        '<%= concat.js.dest %>'
                    ]
                }
            },
            search: {
                files: {
                    '<%= dist_js_path %>/<%= pkg.name %>.search.min.js': [
                        '<%= concat.search.dest %>'
                    ]
                }
            },
            contact: {
                files: {
                    '<%= dist_js_path %>/<%= pkg.name %>.contact.min.js': [
                        '<%= concat.contact.dest %>'
                    ]
                }
            }
        },

        env: {
            development: {
                BASE_URL: function () {
                    return baseUrl('https://cercal.dev/');
                }
            },
            production: {
                BASE_URL: function () {
                    return baseUrl('https://cercal.io/');
                }
            }
        },

        shell: {
            options: {
                stderr: true,
                stdout: true
            },
            development: {
                command: function () {
                    var buildDraft = shouldBuildDraft() ? ' --buildDrafts ' : ' ';

                    var cmd = 'hugo' + buildDraft + '--baseURL ' + EnvironmentVariable.get('BASE_URL');

                    grunt.log.ok(cmd);

                    return cmd;
                }
            },
            production: {
                command: function () {
                    var cmd = 'hugo --baseURL ' + EnvironmentVariable.get('BASE_URL');

                    grunt.log.ok(cmd);

                    return cmd;
                }
            }
        },

        watch: {
            dist: {
                files: [
                    '<%= src_path %>/**/*',
                    'content/**/*',
                    'data/**/*',
                    'i18n/**/*',
                    'layouts/**/*',
                    'static/**/*',
                ],
                tasks: ['default'],
                options: {
                    livereload: true,
                }
            }
        },

        hugo_lunr: {
            development: {
                options: {
                    buildDraft: shouldBuildDraft()
                }
            },
            production: {
                options: {
                    buildDraft: shouldBuildDraft()
                }
            }
        },

        notify_hooks: {
            options: {
                enabled: true,
                max_jshint_notifications: 5,
                title: "<%= pkg.name %>",
                success: true,
                duration: 2
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-xmlmin');
    grunt.loadNpmTasks('grunt-html');

    grunt.registerTask("hugo_lunr", function(env) {
        grunt.config.requires('hugo_lunr.' + env + '.options.buildDraft');

        var buildDraft = grunt.config.get('hugo_lunr.' + env + '.options.buildDraft');
        
        var authors = grunt.file.readYAML('data/authors.yml');
        var categories = grunt.file.readYAML('data/categories.yml');
        var contentDir = grunt.file.readYAML('config.yaml').contentDir + '/posts';

        var pages = [];

        var getFrontMatter = function (abspath, filename) {
            grunt.verbose.ok('Reading "' + abspath + '"...');

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
            grunt.log.writeln('> Processing "' + frontMatter.slug + '/' + S(filename).trim() + '".');

            var language = S(filename).endsWith('.en.md') ? 'en' : 'pt';

            var image = frontMatter.slug + '/index.svg';

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

        grunt.log.writeln("Build search index");
        grunt.log.writeln('Reading files from "./' + contentDir + '/"...');

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

        grunt.log.ok("Index built (" + pages.length + ' processed)');
    });

    grunt.registerTask('w', [
        'watch'
    ]);

    grunt.registerTask('main', [
        'clean:dist',
        'less',
        'sass',
        'concat'
    ]);

    grunt.registerTask('default', [
        'main',
        'hugo_lunr:development',
        'env:development',
        'shell:development',
        'copy:development',
        'processhtml:development',
        'csslint',
        'jshint',
        'htmllint',
        'notify_hooks'
    ]);

    grunt.registerTask('production', [
        'main',
        'hugo_lunr:production',
        'env:production',
        'shell:production',
        'copy:production',
        'processhtml:production',
        'uglify',
        'cssmin',
        'imagemin',
        'htmlmin',
        'xmlmin',
        'csslint',
        'jshint',
        'htmllint',
        'clean:unminified',
        'notify_hooks'
    ]);
};