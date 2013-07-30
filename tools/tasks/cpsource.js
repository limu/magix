/*
 * grunt-cpsource
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

    var SEP = Path.sep;
    var MAGIX = 'magix';
    var MXEXT = 'mxext';
    var TMPL = 'tmpl';

    // ==========================================================================
    // TASKS
    // ==========================================================================
    //生成目录结构为：tmp/magix tmp/mxext tmp/tmpl
    grunt.registerMultiTask('cpsource', 'copy source code due to platType and loaderType', function() {
        var srcDir = this.data.source;
        var dir = this.data.dir;
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        console.log('platType is:' + platType, 'loaderType is:' + loaderType);
        var source = [srcDir, platType].join(SEP);
        var magixSource = [srcDir, platType, MAGIX, loaderType].join(SEP);
        var mxextSource = [srcDir, platType, MXEXT, loaderType].join(SEP);
        var magixTmplSource = [srcDir, platType, MAGIX, TMPL].join(SEP);
        var mxextTmplSource = [srcDir, platType, MXEXT, TMPL].join(SEP);

        grunt.config.set('copy', {
            main: {
                files: [{
                    expand: true,
                    cwd: magixSource,
                    src: ['**'],
                    dest: [dir, MAGIX].join(SEP)
                }, {
                    expand: true,
                    cwd: mxextSource,
                    src: ['**'],
                    dest: [dir, MXEXT].join(SEP)

                }, {
                    expand: true,
                    cwd: magixTmplSource,
                    src: ['**'],
                    dest: [dir, MAGIX + TMPL].join(SEP)

                }, {
                    expand: true,
                    cwd: mxextTmplSource,
                    src: ['**'],
                    dest: [dir, MXEXT + TMPL].join(SEP)

                }]

            }
        });
        grunt.task.run('copy');

    });
};