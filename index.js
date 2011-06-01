(function(){
    if (!window.console) {
        window.console = {
            log: function(s){
                //alert(s);
            },
            dir: function(s){
                alert(s);
            },
            warn: function(s){
                alert("[warn]:" + s);
            },
            error: function(s){
                alert("[error]:" + s);
            }
        };
    }
    var pagePath = location.href.split("#")[0].split("index.html")[0];
    seajs.config({
        debug: 2,
        alias: {
            'backbone': 'backbone-debug',
            'underscore': 'underscore-debug',
            'jquery': 'jquery-debug',
            'mustache': 'mustache-debug',
            'app': pagePath + 'app',
            'libs': pagePath + 'libs'
        },
        charset: 'utf-8',
        timeout: 20000
    });
    window.onload = function(){
        seajs.use(['backbone', 'libs/magix/controller'], function(Backbone){
            Backbone.history.start();
        });
    };
})();
