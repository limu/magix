define(function(require){
    var $ = require("jquery");
    var templates = require("./controller").env.templates;
    var helper = {};
    helper.ajax = $.ajax;
    helper.getTemplate = function(uri, cb){
        var t = (new Date()).getTime();
        if (templates[uri]) {
            cb(templates[uri]);
        }
        else {
            console.log("get template:" + uri);
            helper.ajax(uri + "?__t=" + t, {
                dataType: "text",
                success: function(data){
                    templates[uri] = data;
                    cb(data);
                }
            });
        }
    };
    return helper;
});
