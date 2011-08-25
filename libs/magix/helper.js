/**
 * 通用方法
 * @module helper
 * @requires jquery,libs/magix/controller
 */
/**
 * 通用方法静态类
 * @class Helper
 * @namespace libs.magix
 * @static
 */
define(function(require){
    var $ = require("libs/jquery");
    var templates = require("libs/magix/controller").env.templates;
    var helper = {};
    helper.ajax = $.ajax;
    /**
     * 获取模板后回调
     * @method getTemplate
     * @param {String} uri 模板地址
     * @param {Function} cb 获取模板后回调,回调函数将接收到一个参数为模板字符串
     */
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
