/**
 * 将所有的js处理为min.js
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

    grunt.registerMultiTask('minify', 'minify js', function() {
        var jsHome = this.data.src; //传入js文件夹路径
        var tarFiles = Helper.getAllFiles(jsHome);
        var jsFiles = Helper.getTypedFiles(tarFiles, ".js");
        var jsMinMap = {};
        for (var i = 0; i < jsFiles.length; i++) {
            var tarJs = jsFiles[i],
                srcJs = [];
            var destJs = tarJs.split(".js")[0] + "-min.js";
            jsMinMap[destJs] = new Array(tarJs);
        }

        grunt.config.set('uglify', {
            my_target: {
                files: jsMinMap
            }
        });
        grunt.task.run('uglify');
        

    });

};