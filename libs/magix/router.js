/**
 * Magix Router 负责监控hash变化,并根据变化后的hash值pathname部分,分发给相应的controller模块.
 * @module	magix/router
 * @author limu@taobao.com
 * @reqiure "backbone"
 * @usage hash与模块对应关系规则:
 * 由"#!"开始最后一个斜线之前的部分为pathname,由对应app/controllers/ + pathname负责展现
 * 最后一个斜线之后的部分,对应参数对象,键值对将被解析为JS Object
 * hash为空时对应由config/init的indexPath属性指定首页controller
 * 响应controller没有找到,则由config/ini的notFoundPath属性指定404页面controller
 * hash被解析为queryModel,是一个Backbone.Model,包含所有query参数和pathname,query,referrer信息.
 * 		"#!/x/"       => queryModel:{pathname:"app/controllers/x",            query:"/x/",        referrer:""}
 * 		"#!/x/a=1&b=2 => queryModel:{pathname:"app/controllers/x",   a:1,b:2  query:"/x/a=1&b=2", referrer:""}
 * 		"#!/y/z"      => queryModel:{pathname:"app/controllers/y",   z:""     query:"/y/z",       referrer:""}
 * 		"#!/y/z/"     => queryModel:{pathname:"app/controllers/y/z",          query:"/y/z/",      referrer:""}
 * 		""            => queryModel:{pathname:config/ini.indexPath,           query:"",           referrer:""} 
 * 		"#!/notfound/"=> queryModel:{pathname:config/ini.notFoundPath,        query:"",           referrer:""}  
 */
/**
 * MxRouter router构造器,传入config/ini后生成单例
 * @class MxRouter
 * @extend Backbone.Controller
 * @param {Object} options {config:ini}
 * @singleton
 */

/**
 * MxQuery queryModel构造器,
 * @class MxQuery
 * @extend Backbone.Model
 * @param {Object} attributes 包含pathname,query,referrer和所有解析为键值对的url参数
 * @constructor
 */
define(function(require, exports, module){
    var Backbone = require("backbone");
    var _ = require("underscore");
    var MxQuery = require("./query_model");
    //router继承自Backbone.Controller,将其中router功能提取出来加以扩展,为hash生成queryModel对象.
    //将每个页面的controller独立成单独的文件,queryModel.pathname一一对应,由router根据pathname载入对应controller运行
    var MxRouter = Backbone.Controller.extend({
        //生成实例,为config赋值
        initialize: function(o){
            this.config = o.config;
        },
        //hash值除去了开始的!部分,成为我们的原始query.
        routes: {
            "!*query": "_route",
            "*query": "_route"
        },
        //记录原始query和referrer并开始构造queryModel
        _route: function(query){			
            this.referrer = this.query || "";
            this.query = query;
            this._buildQueryModel(query);
        },
        //当pathname发生变化时构造queryModel并引入pathname对应的新页面,pathname不变时根据参数改变其属性值
        _buildQueryModel: function(query){
            var i, tmpArr, paraArr, kv, k, v, paraObj = {}, dogoto = true;
            this.pathName = this.config.indexPath;
            if (query) {
                tmpArr = query.split("/");
                paraArr = tmpArr.pop().split("&");
                this.pathName = tmpArr.join("/");
                for (i = 0; i < paraArr.length; i++) {
                    kv = paraArr[i].split("=");
                    if (kv[0]) {
                        paraObj[kv[0]] = kv[1] || "";
                    }
                }
            }
			//debugger;
            if (this.queryModel) {
				if (this.queryModel.get("pathname") != this.pathName) {
					//this.queryModel.unbind()
				}else{
					dogoto = false;
				}
                this.queryModel.clear({
                    silent: true
                });				
                this.queryModel.set(_.extend(paraObj, {
                    referrer: this.referrer,
                    query: this.query,
                    pathname: this.pathName
                }),{
                    silent: dogoto
                });
            }
            else {
                this.queryModel = new MxQuery(_.extend(paraObj, {
                    referrer: this.referrer,
                    query: this.query,
                    pathname: this.pathName
                }));                
            }
            if (dogoto) {
                this._goto();
            }
            window.MXQueryMode = this.queryModel; //TODO del
        },
        //调用当前queryModel.pathname发生变化时,载入相应的controller,进入页面.
        _goto: function(){
            var self = this;
            var controller;
            module.load("app/controllers" + self.queryModel.get("pathname"), function(Controller){
                if (Controller) {
                    controller = new Controller({
                        queryModel: self.queryModel
                    });
                }//queryModel.pathname对应Controller不存在,说明页面notFound,展示404页面
                else {
                    console.warn("page not found,go to 404");
                    module.load("app/controllers" + self.config.notFoundPath, function(Controller){
                        if (Controller) {
                            controller = new Controller({
                                queryModel: self.queryModel
                            });
                        }
                    });
                }
            });
        }
    });
    return MxRouter;
});
