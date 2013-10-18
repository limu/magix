/*
 * grunt-concatfiles
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

    // ==========================================================================
    // TASKS
    // ==========================================================================
    //concat all useful files
    grunt.registerMultiTask('concatfiles', 'concat magix files due to order', function() {
        var dir = this.data.dir;
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        var distDir = this.data.distDir;
        var isMobile = this.data.isMobile;
        var addMagixStartFile = this.data.addMagixStartFile;

        var combosDir = this.data.combosDir;

        var maPrefix = dir + SEP + MAGIX + SEP;
        var mePrefix = dir + SEP + MXEXT + SEP;
        var magixArr = ['magix', 'router', 'body', 'event', 'vframe', 'view', 'vom'];
        var mxextArr = ['mmanager', 'model', 'view'];
        //删除dist中原来的文件
        var destMagixPrefix = distDir + SEP + platType + SEP + loaderType + '-magix';
        var distArr = ['.js', '-min.js', '-mxext.js', '-mxext-min.js'];
        var magixStartFile = dir + SEP + MAGIX + SEP + 'magix_start.js';
        for (var i = 0; i < distArr.length; i++) {
            var f = destMagixPrefix + distArr[i];
            if (grunt.file.isFile(f)) {
                grunt.file.delete(f, {
                    force: true
                });
            }
        }

        grunt.config.set('copy', {
            main: {
                files: [{
                    expand: true,
                    cwd: maPrefix,
                    src: ['**'],
                    dest: [combosDir, platType, loaderType, MAGIX].join(SEP)
                }, {
                    expand: true,
                    cwd: mePrefix,
                    src: ['**'],
                    dest: [combosDir, platType, loaderType, MXEXT].join(SEP)
                }]

            }
        });

        grunt.task.run('copy');
        //concat 生成库文件
        var maFiles = [];
        for (var i = 0; i < magixArr.length; i++) {
            maFiles.push(maPrefix + magixArr[i] + '.js');
        }

        var meFiles = [];
        for (var i = 0; i < mxextArr.length; i++) {
            meFiles.push(mePrefix + mxextArr[i] + '.js');
        }
        var basicFiles = maFiles;
        var extraFiles = maFiles.concat(meFiles);
        var footer = '';

        if (!isMobile) {
            if (addMagixStartFile) {
                basicFiles = basicFiles.concat(magixStartFile);
                extraFiles = extraFiles.concat(magixStartFile);
            } else {
                footer = ';document.createElement("vframe");';
            }
        }

        grunt.config.set('concat', {
            options: {
                separator: '\n',
                footer: footer
            },
            basic: {
                src: basicFiles,
                dest: destMagixPrefix + '.js'
            },
            extras: {
                src: extraFiles,
                dest: destMagixPrefix + '-mxext.js'
            }

        });
        grunt.task.run('concat');


    });
};