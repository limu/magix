/**
 * Magix Controller 基类,所有具体页面的controller要继承这个类.
 * @module	magix/controller
 * @author limu@taobao.com
 * @reqiure "backbone","underscore","./vom"
 * @usage app中每个具体的controller需要继承此类
 * var MxController = require("libs/magix/controller");
 * var Ctrl = MxController.extend({
 *     viewMode: "module name of the root view" //最外层view对应的模块名
 * });
 */
/**
 * Magix Controller
 * @class MxController
 * @abstract
 */
/**
 * Class MxController To Be Extend
 * @method MxController.extend
 * @param {Object} properties
 * @param {Object} optional classProperties
 * @abstract
 */
/**
 * 当前queryModel对象
 * @property queryModel
 * @type magix/query_model
 */
/**
 * VOM根对应的view模块名,将从这个view从外向内渲染.
 * viewMode以queryMode.__view__为最高优先级,如果没有则以this.viewMod为准,如再未指定,取config/ini的defaultView的值.
 * @property viewMod
 * @type String
 */
define(function(require){
    var _ = require("underscore");
    var Backbone = require("backbone");
    var config = require("config/ini");
    var vom = require("libs/magix/vom");
    var MxController = function(options){
        this.queryModel = options.queryModel;
        this.viewMod = (this.queryModel.get("__view__") && this.queryModel.get("__view__").split("-").join("/")) || this.viewMod || config.defaultViewMod;
        this.initialize();
        this.render();
    };
    _.extend(MxController.prototype, {
        initialize: function(){
        },
        render: function(){
            vom.root.mountView(this.viewMod, {
                queryModel: this.queryModel
            });
        }
    });
    //重用Backbone的extend
    MxController.extend = Backbone.Controller.extend;
    return MxController;
});
