define(function(require, exports){
    var Helper = require("libs/magix/helper");
    exports.templates = {};
    exports.getTemplate = function(uri, cb){
        var t = (new Date()).getTime();
        if (exports.templates[uri]) {
            cb(exports.templates[uri]);
        }
        else {
            console.log("get template:" + uri);
            Helper.ajax(uri + "?__t=" + t, {
                dataType: "text",
                //context: this,
                success: function(data){
                    exports.templates[uri] = data;
                    cb(data);
                }
            });
        }
    };
    window.MXTemplates = exports;
});
