/*
 * grunt-deconsole
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


    // ==========================================================================
    // TASKS
    // ==========================================================================
    //delete console in tmp fileset
    grunt.registerMultiTask('deconsole', 'delete console for the files', function() {
        var dir = this.data.dir;
        //get all zhe files to del
        var allJSFiles = Helper.getAllFiles(dir);
        allJSFiles.forEach(function(f) {
            grunt.file.copy(f, f, {
                process: function(content) {
                    return content = content.replace(/console\.\w+\((.*)\);?/g, function(m) {
                        return '';
                    }).replace(/\/\/KEEP\s/g, '');
                }
            })
        });



    });
};