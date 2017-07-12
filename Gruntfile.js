module.exports = function (grunt) {
    'use strict';

    require('time-grunt')(grunt);

    var yaml = require("js-yaml");
    var md5  = require('md5');
    var S    = require("string");

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
        author_path:     "authors",

        dist_js_path:    "<%= dist_path %>/<%= js_path %>",
        dist_css_path:   "<%= dist_path %>/<%= css_path %>",
        dist_img_path:   "<%= dist_path %>/<%= img_path %>",
        dist_author_path:"<%= dist_path %>/<%= author_path %>",

        src_app_path:    "<%= src_path %>",
        src_less_path:   "<%= src_app_path %>/less",

        jshint: {
            files: ['Gruntfile.js', '<%= src_path %>/**/*.js'],
            options: {
                globals: {
                    console: true
                }
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
            }
        },

        copy: {
            production: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= src_app_path %>/<%= img_path %>/',
                        src: ['**/*.{png,jpg,gif}'],
                        dest: '<%= dist_img_path %>/'
                    },
                    {
                        expand: true,
                        cwd: '<%= src_app_path %>/<%= author_path %>/',
                        src: ['**/*.{png,jpg,gif}'],
                        dest: '<%= dist_author_path %>/'
                    },
                    {
                        src: 'node_modules/javascript-autocomplete/auto-complete.min.js',
                        dest: '<%= dist_path %>/vendor/js/javascript-autocomplete.min.js'
                    }
                ]
            },
            development: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= src_app_path %>/<%= img_path %>/',
                        src: ['**/*.{png,jpg,gif}'],
                        dest: '<%= dist_img_path %>/'
                    },
                    {
                        expand: true,
                        cwd: '<%= src_app_path %>/<%= author_path %>/',
                        src: ['**/*.{png,jpg,gif}'],
                        dest: '<%= dist_author_path %>/'
                    },
                    {
                        src: 'node_modules/javascript-autocomplete/auto-complete.js',
                        dest: '<%= dist_path %>/vendor/js/javascript-autocomplete.js'
                    },
                    {
                        src: 'node_modules/font-awesome/css/font-awesome.css',
                        dest: '<%= dist_path %>/vendor/css/font-awesome.css'
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/font-awesome/fonts/',
                        src: ['**/*'],
                        dest: '<%= dist_path %>/vendor/fonts/'
                    },
                    {
                        src: 'node_modules/material-design-lite/dist/material.indigo-pink.min.css',
                        dest: '<%= dist_path %>/vendor/css/material.indigo-pink.min.css'
                    },
                    {
                        src: 'node_modules/material-design-lite/dist/material.js',
                        dest: '<%= dist_path %>/vendor/js/material.js'
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
            dist: {
                src: [
                    '<%= src_app_path %>/<%= js_path %>/<%= pkg.name %>.js',
                    '<%= src_app_path %>/<%= js_path %>/search.js'
                ],
                dest: '<%= dist_js_path %>/<%= pkg.name %>.js'
            }
        },

        less: {
            dist: {
                options: {
                    banner: '<%= banner %>'
                },
                files: {
                    '<%= dist_css_path %>/<%= pkg.name %>.css': '<%= src_less_path %>/<%= pkg.name %>.less'
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
                        src: ['**/*.xml'],
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
                    ]
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    '<%= dist_js_path %>/<%= pkg.name %>.min.js': [
                        '<%= concat.dist.dest %>'
                    ]
                }
            }
        },

        rcs: {
            css: {
                options: {
                    replaceCss: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= dist_path %>/',
                        src: ['**/*.css'],
                        dest: '<%= dist_path %>/'
                    }
                ]
            },
            all: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= dist_path %>/',
                        src: ['**/*.{js,html}'],
                        dest: '<%= dist_path %>/'
                    }
                ]
            }
        },

        env: {
            development: {
                BASE_URL: 'http://localhost:1313/'
            },
            production: {
                BASE_URL: 'https://cercal.io/'
            }
        },

        shell: {
            options: {
                stderr: true,
                stdout: true
            },
            development: {
                command: 'hugo --buildDrafts --baseURL ' + process.env.BASE_URL
            },
            production: {
                command: 'hugo --baseURL ' + process.env.BASE_URL
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
                    buildDraft: true
                }
            },
            production: {
                options: {
                    buildDraft: false
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

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-rcs');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-xmlmin');
    
    grunt.registerTask("hugo_lunr", function(env) {
        grunt.config.requires('hugo_lunr.' + env + '.options.buildDraft');

        grunt.log.writeln("Build pages index");

        var buildDraft = grunt.config.get('hugo_lunr.' + env + '.options.buildDraft');
        var contentDir = grunt.file.readYAML('config.yaml').contentDir;

        grunt.log.writeln('Reading files from "./' + contentDir + '/"...');

        var indexPages = function() {
            var pagesIndex = [];

            grunt.file.recurse(contentDir, function(abspath, rootdir, subdir, filename) {
                if (S(filename).endsWith(".md")) {
                    var frontMatter = readContentFile(abspath, filename);

                    if (frontMatter != null) {
                        if (buildDraft == true || frontMatter.draft == false) {
                            pagesIndex.push(processMDFile(frontMatter, abspath, filename));
                        }
                    }
                }
            });

            return pagesIndex;
        };

        var readContentFile = function (abspath, filename) {
            grunt.verbose.ok('Reading "' + abspath + '"...');

            var content = grunt.file.read(abspath);
            
            // First separate the Front Matter from the content and parse it
            content = content.split("---");

            var frontMatter = null;

            try {
                frontMatter = yaml.safeLoad(content[1].trim());
                frontMatter.content = content[2];
            } catch (e) {
                conzole.failed(e.message);
            }

            return frontMatter;
        };

        var processMDFile = function(frontMatter, abspath, filename) {
            // Build Lunr index for this page
            return {
                id: md5(frontMatter.title + frontMatter.language + frontMatter.description),
                title: frontMatter.title,
                description: frontMatter.description,
                slug: frontMatter.slug,
                language: S(filename).endsWith('.en.md') ? 'en' : 'pt',
                tags: frontMatter.tags,
                topics: frontMatter.topics,
                content: S(frontMatter.content).trim().stripTags().stripPunctuation().s
            };
        };

        var pages = indexPages();

        grunt.file.write('public/search.json', JSON.stringify(pages));

        grunt.log.ok("Index built (" + pages.length + ' processed)');
    });

    grunt.registerTask('w', [
        'watch'
    ]);

    grunt.registerTask('main', [
        'jshint',
        'clean',
        'concat',
        'less'
    ]);

    grunt.registerTask('default', [
        'main',
        'hugo_lunr:development',
        'env:development',
        'shell:development',
        'copy:development',
        'processhtml:development',
        'notify_hooks'
    ]);

    grunt.registerTask('production', [
        'main',
        'hugo_lunr:production',
        'env:production',
        'shell:production',
        'copy:production',
        'processhtml:production',
        'imagemin',
        'htmlmin',
        'xmlmin',
        'cssmin',
        'uglify',
        'rcs',
        'notify_hooks'
    ]);
};