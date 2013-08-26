/**
 * Copyright (c) 2013 思霏
 * used to package magix
 */
module.exports = function(grunt) {
    var srcDir = '../src';
    var tmpDir = '../tmp';
    var distDir = '../dist';
    var docDir = '../docs';
    var combosDir = '../combos';
    var platType = String(grunt.option('platType')).replace(/'/g, ''); //'1.0' or 'm1.0'
    var loaderType = String(grunt.option('loaderType')).replace(/'/g, ''); //'kissy' or 'seajs'
    var isMobile = platType.charAt(0) == 'm';
    if (!platType || !loaderType) {
        grunt.fail.warn('please enter right params');
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cpsource: {
            build: {
                source: srcDir,
                dir: tmpDir,
                loaderType: loaderType,
                platType: platType
            }
        },
        deconsole: {
            build: {
                dir: tmpDir
            }
        },
        subtmpls: {
            build: {
                dir: tmpDir
            }
        },
        concatfiles: {
            build: {
                dir: tmpDir,
                distDir: distDir,
                loaderType: loaderType,
                platType: platType,
                combosDir: combosDir,
                isMobile: isMobile
            }
        },
        removeunimpl: {
            build: {
                distDir: distDir,
                loaderType: loaderType,
                platType: platType
            }
        },
        compresslibs: {
            build: {
                distDir: distDir,
                loaderType: loaderType,
                platType: platType
            }
        },
        unsetry: {
            build: {
                distDir: distDir,
                loaderType: loaderType,
                platType: platType
            }
        },
        generatedoc: {
            build: {
                docDir: docDir,
                dir: tmpDir,
                loaderType: loaderType,
                platType: platType
            }
        },
        clean: {
            options: {
                force: true
            },
            build: {
                src: [tmpDir]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadTasks('tasks');
    grunt.registerTask('default', ['cpsource', 'deconsole', 'subtmpls', 'generatedoc', 'concatfiles', 'removeunimpl', 'compresslibs', 'unsetry', 'clean']);
    // grunt.registerTask('default', ['exec']);
};