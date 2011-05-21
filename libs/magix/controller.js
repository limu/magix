/**
 * Magix Controller 基类,所有具体页面的controller要集成这个类.
 * @module	magix/controller
 * @author limu@taobao.com
 * @reqiure "backbone","underscore","./vom"
 * @usage app中每个具体的view需要继承此类
 * var MxController = require("libs/magix/controller");
 * var Ctrl = MxController.extend({
 *     initialize: function(){
 *         console.log("to show " + this.view);
 *     }
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
 * View Object Model对象,详见magix/vom模块
 * @property vom
 * @type Object
 */
/**
 * 初始化参数对象
 * @property options
 * @type Object
 */
/**
 * router单例
 * @property router
 * @type Object
 */
/**
 * 当前query对象
 * @property query
 * @type Object
 */
/**
 * referrer的query对象
 * @property referrer
 * @type Object
 */
/**
 * 初始化配置对象
 * @property config
 * @type Object
 */
/**
 * 初始化资源数据对象
 * @property resource
 * @type Object
 */
/**
 * VOM根对应的view模块名,将从这个view从外向内渲染.
 * view首先以传入位置,如果没有传入以query.para.__view__为准,再没有取config.defaultView的值.
 * @property view
 * @type String
 */
define(function(require){
    var _ = require("underscore");
    var Backbone = require("backbone");
    var vom = require("./vom");
    var MxController = function(options){
        this.vom = vom;
        this.options = options;
        this.router = this.options.router;
        this.query = this.router.query;
        this.referrer = this.router.referrer;
        this.config = this.router.config;
        this.resource = this.router.resource;
        this.view = this.options.view || (this.query.para && this.query.para.__view__) || this.config.defaultView;
        this.initialize();
    };
    _.extend(MxController.prototype, {});
    //重用Backbone的extend
    MxController.extend = Backbone.Controller.extend;
    return MxController;
});
