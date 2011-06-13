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

define(function(require, exports, module){
    var Backbone = require("backbone");
	var _ = require("underscore");
    var vom = require("./vom");
    var config = require("app/config/ini");
	
	var  MxController = function(){
		this.initialize();
	};
	
    _.extend(MxController.prototype,Backbone.Event, {
        initialize: function(o){
            var p2v = config.pathViewMap, viewName;
            for (var k in p2v) {
                if (!p2v[k]) {
                    p2v[k] = config.defaultViewName;
                }
            }
            this.env = {
                appHome: config.uri.split("app/config/ini")[0],
                templates: {}
            };
            return this;
        },
        _route: function(query){
            this.referrer = this.query || null;
            this.query = query;
            this.pathName = config.indexPath;
            this.paraObj = {};
            this._fixPathPara(query);
            this.oldViewName = this.viewName;
            this.viewName = this._getViewName();
            this._mountView();
            this.postData = null;
            //this.saveLocation("!"+this.query);
        },
        setPostData: function(o){
            this.postData = o;
        },
		navigateTo:function(q){
			var np = this.unParam(q);
			var v1 = _.clone(this.paraObj);
			delete v1.referrer;
			delete v1.pathname;
			delete v1.query;
			delete v1.postdata;
			var v2 = _.extend(v1,np);
			var nps = this.param(v2);
			//var nps = this.param(_.extend(_.clone(this.paraObj),np));
			this._goto(this.pathName+"/"+nps);
		},
		_goto:function(url){
			location.hash = "!"+url;
		},
        _mountView: function(){
            var queryObject = this._getQueryObject();
            if (this.viewName == this.oldViewName) {
                this._fixQueryObject(queryObject);
                this.queryModel.set(queryObject);
            }
            else {
                this.queryModel = new Backbone.Model(queryObject);
                vom.root.mountView(this.viewName, {
                    queryModel: this.queryModel
                });
            }
        },
        _fixQueryObject: function(queryObject){
            if (this.queryModel) {
                var k, old = this.queryModel.toJSON();
                for (k in old) {
                    if (!(k in queryObject)) {
                        queryObject[k] = "";
						//this.queryModel.unset(k);

                    }
                }
            }
        },
        _getQueryObject: function(){
            var queryObject = _.extend(this.paraObj, {
                referrer: this.referrer,
                query: this.query,
                pathname: this.pathName,
                postdata: this.postData || null
            });
            return queryObject;
        },
        _getViewName: function(){
            var p2v = config.pathViewMap, viewName;
            if (p2v[this.pathName]) {
                viewName = p2v[this.pathName];
            }
            else {
                viewName = p2v[config.notFoundPath];
            }
            if (this.paraObj.__view__) {
                viewName = this.paraObj.__view__.split("-").join("/");
            }
            return viewName;
        },
        _fixPathPara: function(query){
            var tmpArr, paraStr, kv;
            if (query) {
                tmpArr = query.split("/");
                paraStr = tmpArr.pop();
                this.pathName = tmpArr.join("/");
                this.paraObj = this.unParam(paraStr);
            }
        },
        unParam: function(s){
            var paraArr = s.split("&");
            var kv, res = {};
            for (var i = 0; i < paraArr.length; i++) {
                kv = paraArr[i].split("=");
                if (kv[0]) {
                    res[kv[0]] = kv[1] || "";
                }
            }
            return res;
        },
        param: function(o){
            var res = [];
            for (var k in o) {
                res.push(k + "=" + o[k]);
            }
            return res.join("&");
        }
    });
    if (!MxController.inst) {
        MxController.inst = new MxController();
    }
    window.MXController = MxController.inst;
    return MxController.inst;
});
