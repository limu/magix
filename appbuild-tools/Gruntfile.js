/**
 * magix 项目打包脚本
 */
module.exports = function(grunt) {
    var appDir = grunt.option("appDir");
    var destDir = grunt.option("destDir");
    var isDelSourceJs=grunt.option('isDelSourceJs')||true;
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: {
                src: destDir
            },
            options: {
                force: true
            }
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: appDir,
                    src: ['**'],
                    dest: destDir
                }]
            }
        },
        combine:{
            build:{
                appSrc:destDir
            }
        },
        minify:{
            build:{
                src:destDir,
                isBeautify:true
            }
        },
        clear:{
            build:{
                src:destDir,
                isDelSourceJs:isDelSourceJs
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadTasks('tasks');
    grunt.registerTask('pack', ['clean', 'copy', 'combine','minify','clear']);



};