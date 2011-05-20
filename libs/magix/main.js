define(function(require, exports, module){
    module.exports = function(config, resource){
        var Backbone = require("backbone");
        var MxRouter = require("./router");
        var mxview = document.createElement("mxview");
        mxview = null;
        var mxRouter = new MxRouter({
            config: config,
            resource: resource
        });
        window.mxRouter = mxRouter;//to del
        Backbone.history.start();
    };
});
