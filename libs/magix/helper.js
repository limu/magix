/**
 * 通用方法
 * @module helper
 * @requires jquery,magix/controller
 */
/**
 * 通用方法静态类
 * @class Helper
 * @namespace libs.magix
 * @static
 */
define("magix/helper", ["jquery", "magix/controller"], function(require) {
    var $ = require("jquery");
    var templates = require("magix/controller").env.templates;
    var helper = {};
    helper.ajax = $.ajax;
    /**
     * 获取模板后回调
     * @method getTemplate
     * @param {String} uri 模板地址
     * @param {Function} cb 获取模板后回调,回调函数将接收到一个参数为模板字符串
     */
    helper.getTemplate = function(uri, cb) {
        var t = (new Date()).getTime();
        if (templates[uri]) {
            cb(templates[uri]);
        } else {
            console.log("get template:" + uri);
            helper.ajax(uri + "?__t=" + t, {
                dataType : "text",
                success : function(data) {
                    templates[uri] = data;
                    cb(data);
                }
            });
        }
    };
    return helper;
});
