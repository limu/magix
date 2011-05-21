/**
 * Magix 主程序入口,提供一个函数,接收配置和数据并启动Magix.
 * @module	magix/main
 * @author limu@taobao.com
 * @reqiure "backbone","./router"
 * @usage
 * window.onload = function(){
 *     seajs.use(['libs/magix/main', 'config/init', 'app/resources/init'], function(main, config, resource){
 *         main(config, resource);
 *     });
 * };
 */
/**
 * @method exports 接收配置和资源数据,生成router实例,启动history服务
 * @param {Object} config 全局初始化配置,对应应用config/init模块,定义系统的首页位置,404页面位置等相关配置
 * @param {Object} resource 全局初始化资源数据,对应应用的app/resource/init模块
 * @caution config和resource作为全局初始化配置和资源,每次进入页面时加载,应该控制其内仅包含页面初始化必须的配置和资源
 */
define(function(require, exports, module){
    module.exports = function(config, resource){
        var Backbone = require("backbone");
        var MxRouter = require("./router");
        //使用配置和数据实例化Router
        var mxRouter = new MxRouter({
            config: config,
            resource: resource
        });
        //启动Backbone历史服务,启动之后系统将响应hashchange事件,并将hash参数自动分发给router处理.
        Backbone.history.start();
		window.router = mxRouter;//todo delete
    };
});
