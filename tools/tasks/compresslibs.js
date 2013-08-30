/*
 * grunt-compresslibs
 * Copyright (c) 2013 思霏
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    // Grunt utilities.
    var task = grunt.task;
    var file = grunt.file;
    var utils = grunt.utils;
    var log = grunt.log;
    var verbose = grunt.verbose;
    var fail = grunt.fail;
    var option = grunt.option;
    var config = grunt.config;
    var template = grunt.template;

    // external dependencies
    var Fs = require('fs');
    var Path = require('path');
    var Helper = require('../libs/helper');

    var SEP = Path.sep;
    var MAGIX = 'magix';
    var MXEXT = 'mxext';

    grunt.registerMultiTask('removeunimpl', 'remove unimpl', function() {
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        var distDir = this.data.distDir;

        var destMagixPrefix = distDir + SEP + platType + SEP + loaderType + '-magix';

        [destMagixPrefix + '.js', destMagixPrefix + '-mxext.js'].forEach(function(f) {
            grunt.file.copy(f, f, {
                process: function(content) {
                    content = content.replace(/\w+:\s*(Magix\.)?unimpl\s*,?/g, '');
                    content = content.replace(/include\s*:\s*Include,/g, '');
                    content = content.replace(/debug\s*:\s*'\*_\*',/, '//debug-*_*');
                    return content;
                }
            });
        });
    });
    // ==========================================================================
    // TASKS
    // ==========================================================================
    //concat all useful files
    grunt.registerMultiTask('compresslibs', 'compress lib files', function() {
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        var distDir = this.data.distDir;

        var destMagixPrefix = distDir + SEP + platType + SEP + loaderType + '-magix';
        var jsMinMap = {};
        jsMinMap[destMagixPrefix + '-min.js'] = destMagixPrefix + '.js';
        jsMinMap[destMagixPrefix + '-mxext-min.js'] = destMagixPrefix + '-mxext.js';

        //begin 压缩吧～
        grunt.config.set('uglify', {
            options: {},
            my_target: {
                files: jsMinMap
            }
        });
        grunt.task.run('uglify');

    });

    grunt.registerMultiTask('unsetry', 'remove try catch', function() {
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        var distDir = this.data.distDir;

        var destMagixPrefix = distDir + SEP + platType + SEP + loaderType + '-magix';

        [destMagixPrefix + '.js', destMagixPrefix + '-mxext.js'].forEach(function(f) {
            grunt.file.copy(f, f, {
                process: function(content) {
                    content = content.replace(/\S*\/\*_\*\//g, '');
                    content = content.replace('//debug-*_*', "debug:'*_*',");
                    content = content.replace('//KEEPCONSOLE', 'console');
                    return content;
                }
            });
        });
    });
};