/*
 * grunt-generatedoc
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
    //generate doc
    grunt.registerMultiTask('generatedoc', 'generatedoc', function() {
        var dir = this.data.dir;
        var platType = this.data.platType;
        var loaderType = this.data.loaderType;
        var docDir = this.data.docDir;

        var outPutDocDir = docDir + SEP + loaderType + SEP + platType;
        var jsdocDir = 'jsdoc-toolkit';


        //清理原来的文档
        if (grunt.file.exists(outPutDocDir)) {
            grunt.file.delete(outPutDocDir, {
                force: true
            });
        }

        var inputDocFiles = dir + SEP + '*.*';
        //console.log('commond is','java -jar jsdoc-toolkit/jsrun.jar '+inputDocFiles+' -e=utf-8 -t=jsdoc-toolkit/templates/mgdoc -d='+outPutDocDir);
        grunt.file.mkdir(outPutDocDir);
        grunt.config.set('exec', {
            docfy: {
                //  cmd:'jsduck '+inputDocDir+' --builtin-classes --output='+outPutDocDir+' --encoding=utf-8'
                cmd: 'java -jar jsdoc-toolkit/jsrun.jar jsdoc-toolkit/app/run.js -p=true -e=utf-8 -t=jsdoc-toolkit/templates/mgdoc -d=' + outPutDocDir + ' ' + inputDocFiles
            }
        });
        grunt.task.run('exec');

    });
};