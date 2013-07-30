/*
 * grunt-subtmpls
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
    var TMPL = 'tmpl';
    var MAGIX = 'magix';
    var MXEXT = 'mxext';


    // ==========================================================================
    // TASKS
    // ==========================================================================
    // substitude tmpls for magix and mxext
    grunt.registerMultiTask('subtmpls', 'substitude tmpls in magix', function() {
        var dir = this.data.dir;

        var folders = [MAGIX, MXEXT];
        folders.forEach(function(folder) {
            var fromFolder = dir + SEP + folder;
            var fromTmplFolder = dir + SEP + folder + TMPL;
            var files = Helper.getAllFiles(fromFolder);
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var name = Path.basename(file);
                var bname = Path.basename(file, '.js');
                var tmplFile = fromTmplFolder + SEP + name;
                if (grunt.file.isFile(tmplFile)) {
                    var include;
                    if (bname == 'magix') {
                        include = 'Include';
                    } else {
                        include = 'Magix\\.include';
                    }
                    var evalReg = new RegExp("eval\\(" + include + "\\('\\.{2}\\/tmpl\\/" + bname + "'\\s*,?\\s*1?\\s*\\){2};?");
                    var tmpls = grunt.file.read(tmplFile);
                    var commentsReg = /#begin\s+([^#]+)#([\S\s]*?)#end#/g;
                    grunt.file.copy(file, file, {
                        process: function(content) {

                            content = content.replace(evalReg, function() {
                                return tmpls;
                            });
                            var cmts = {};
                            content.replace(commentsReg, function(m, title, cnt) {
                                cmts[title] = cnt;
                            });
                            for (var p in cmts) {
                                var reg = new RegExp('#' + p + '#', 'g');
                                content = content.replace(reg, cmts[p]);
                            }
                            return content;
                        }
                    });
                }
            }
            grunt.file.delete(fromTmplFolder, {
                force: true
            });
        });
    });
};