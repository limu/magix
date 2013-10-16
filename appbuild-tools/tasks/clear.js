/**
 * 清楚模板和原始js文件
 */
module.exports = function(grunt) {
    var Task = grunt.task;
    var File = grunt.file;
    var Utils = grunt.utils;
    var Log = grunt.log;
    var Verbose = grunt.verbose;
    var Fail = grunt.fail;
    var Option = grunt.option;
    var Config = grunt.config;
    var Template = grunt.template;
    var Fs = require('fs');
    var Path = require('path');
    var SEP = Path.sep;
    var Helper = require('../libs/helper');
    var VIEWS = 'views';
    

    grunt.registerMultiTask('clear', 'clear empty files', function() {
        var appHome = this.data.src; //传入app文件夹路径
        var isDelSourceJs=this.data.isDelSourceJs||false;
        var tarFiles = Helper.getAllFiles(appHome);
        var viewJsFiles = Helper.getTypedFiles(tarFiles, ".js");
        if(isDelSourceJs==false)return;
        for (var i = 0; i < viewJsFiles.length; i++) {
            if (viewJsFiles[i].indexOf('-min')==-1) {
                grunt.file.delete(viewJsFiles[i], {
                    force: true
                });
            }


        }


    });

};