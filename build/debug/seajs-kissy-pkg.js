define("magix/ajax", ["magix/impls/ajax", "magix/base"], function(require) {
    var impl = require("magix/impls/ajax");
    var Base = require("magix/base");
    var Ajax;
    eval(Base.include("tmpls/ajax"));
    return Base.implement(Ajax,impl);
});/*
 * magix/base:提供一些基础方法供各个模块使用
 * 其中mix,include,unimpl方法是模板模块与实现模块分离的基础,需最先定义在实现模块中
 * 		mix(r,s,ov,wl):将s的内容混入r，ov=true：覆盖,wl=undefined:白名单
 * 		include:仅开发时使用,讲template模块同名文件,通过xhr同步获取后eval执行
 * 		unimpl:一个固定函数,用作每个abstract方法的初始值,如果abstract方法未实现,调用这个会抛出异常
 */
define("magix/base", ["magix/impls/base"], function(require) {
	var impl = require("magix/impls/base");
	var mix = function mix(r, s, ov, wl) {
		if(!s || !r) {
			return r;
		}
		if(ov === undefined) {
			ov = true;
		}
		var i, p, l;
		if(wl && ( l = wl.length)) {
			for( i = 0; i < l; i++) {
				p = wl[i];
				if( p in s) {
					if(ov || !( p in r)) {
						
						r[p] = s[p];
					}
				}
			}
		} else {
			for(p in s) {
				if(ov || !( p in r)) {
					r[p] = s[p];
				}
			}
		}
		return r;
	};
	var include = function include(path) {
		var url = Magix.config.magixHome + "../" + path + ".js?r=" + Math.random();
		var xhr = window.ActiveXObject || XMLHttpRequest;
		var r = new xhr('Microsoft.XMLHTTP');
		r.open('GET', url, false);
		r.send(null);
		return r.responseText;
	};
	var unimpl = function UNIMPLEMENTED() {
		throw new Error("unimplement method");
	};
	var Base = {};
	Base.mix = mix;
	Base.include = include;
	Base.unimpl = unimpl;
	eval(Base.include("tmpls/base"));
	Base.mix(Base, impl);
	return Base;
});
define("magix/impls/ajax",function(require){
    var S=KISSY,
        Ajax={},
        io;
    S.use('ajax',function(S,IO){io=IO});
    Ajax.send=function(ops){
		var me=this;
        ops=this.processOptions(ops);
		var oldSucc=ops.success,
			oldErr=ops.error;
        io(S.mix(ops,{
            url:ops.url,
            dataType:ops.dataType,
			type:ops.method,
            success:function(data,textStatus,xhr){
				me.fireGlobalSetting(xhr);
                oldSucc.call(ops,data);
            },
            error:function(data,textStatus,xhr){
				me.fireGlobalSetting(xhr);
                oldErr.call(ops,textStatus);
            }
        }));
    }
    return Ajax;
});
define("magix/impls/base", function(require) {
	var toString=Object.prototype.toString;
	var iBase = {
		isFunction : function(o) {
			return toString.call(o) === '[object Function]';
		},
		isArray : function(o) {
			return toString.call(o) === '[object Array]';
		},
		isString : function(o) {
			return toString.call(o) === '[object String]';
		},
		isPlainObject : function(o) {
			return o && toString.call(o) === '[object Object]' && !o.nodeType && !o.setInterval;
		},
		requireAsync : function(modName, fn) {
			require.async(modName,fn);
		},
		Events : {

			// Bind an event, specified by a string name, `ev`, to a `callback` function.
			// Passing `"all"` will bind the callback to all events fired.
			bind : function(ev, callback, context) {
				var calls = this._callbacks || (this._callbacks = {});
				var list = calls[ev] || (calls[ev] = []);
				list.push([callback, context]);
				return this;
			},
			// Remove one or many callbacks. If `callback` is null, removes all
			// callbacks for the event. If `ev` is null, removes all bound callbacks
			// for all events.
			unbind : function(ev, callback) {
				var calls;
				if(!ev) {
					this._callbacks = {};
				} else if( calls = this._callbacks) {
					if(!callback) {
						calls[ev] = [];
					} else {
						var list = calls[ev];
						if(!list)
							return this;
						for(var i = 0, l = list.length; i < l; i++) {
							if(list[i] && callback === list[i][0]) {
								list[i] = null;
								break;
							}
						}
					}
				}
				return this;
			},
			// Trigger an event, firing all bound callbacks. Callbacks are passed the
			// same arguments as `trigger` is, apart from the event name.
			// Listening for `"all"` passes the true event name as the first argument.
			trigger : function(eventName) {
				var list, calls, ev, callback, args;
				var both = 2;
				if(!( calls = this._callbacks))
					return this;
				while(both--) {
					ev = both ? eventName : 'all';
					if( list = calls[ev]) {
						for(var i = 0, l = list.length; i < l; i++) {
							if(!( callback = list[i])) {
								list.splice(i, 1);
								i--;
								l--;
							} else {
								args = both ? Array.prototype.slice.call(arguments, 1) : arguments;
								callback[0].apply(callback[1] || this, args);
							}
						}
					}
				}
				return this;
			}
		}
	};
	return iBase;
});
define("magix/impls/model",["magix/base"], function(require) {
	var S=KISSY,
		Base=require("magix/base"),
		iModel;
	S.use('mvc',function(S,MVC){
		iModel=MVC.Model;
	});
	S.mix(iModel.prototype,Base.Events);
	
	//
	//让kissy中的事件传递给magix
	var oldFire=iModel.prototype.fire;
	iModel.prototype.fire=function(type,eventData){
	    oldFire(type,eventData);
		if(type.charAt(0)=='*'){//这。。我想跳河了。。。
			type=type.substring(1).replace(/[A-Z]/,function(m){//第一个大写字母转小写
				return m.toLowerCase();
			});
			
			this.trigger(type,eventData);
		}else{
			this.trigger(type,eventData);
		}
	};
	iModel.prototype.unset=function(prop){
		this.removeAttr(prop);
	};
	iModel.prototype.clear=function(){
		var json=this.toJSON();
		for(var prop in json){
			this.removeAttr(prop);
		}
	};
	return iModel;
});define("magix/impls/router", ["magix/base", "magix/model", "magix/vom", "app/config/ini"], function(require) {
	var Base = require("magix/base");
	var Model = require("magix/model");
	var VOM = require("magix/vom");
	var appConfig = require("app/config/ini");
	var MVC;
	KISSY.use('mvc',function(S,mvc){MVC=mvc});
	var iRouter = {
		getAppConfig : function() {
			var p2v = appConfig.pathViewMap;
			if(appConfig.defaultViewName) {
				for(var k in p2v) {
					if(!p2v[k]) {
						p2v[k] = appConfig.defaultViewName;
					}
				}
			}
			return appConfig;
		},
		getVOMObject:function(){
			return VOM;
		},
		setStateListener : function() {
			/*var self = this;
			MxHistory.setHashListener(function(hash) {
				
				self.route(hash);
			});*/
			var self = this;
			var router = new MVC.Router();
			router.addRoutes({
				'*hash':function(s){
					KISSY.log(s.hash);
					self.route(s.hash);
				}
			});
			MVC.Router.start({
				triggerRoute:1,
        		//nativeHistory:1,
        		urlRoot:location.href.split("#")[0].split("index.html")[0]
			});
		},
		parseState : function(stateString) {
			//todo:html5 pushState
			return this._parseHash(stateString);
		},
		_parseHash : function(hashQuery) {
			var hash = {}, tmpArr, paraStr, kv;
			hash.pathName = this.appConfig.indexPath;
			hash.paraObj = {};
			hash.referrer = (this.state && this.state.query) || null;
			hash.query = hashQuery;
			if(hashQuery) {
				tmpArr = hashQuery.split("/");
				paraStr = tmpArr.pop();
				hash.pathName = tmpArr.join("/");
				hash.paraObj = Base.unParam(paraStr);
			}
			return hash;
		},
		parseSearch : function() {
			//todo:html5 pushState
			return this._parseSearch();
		},
		_parseSearch : function() {
			var search = {}, prefix = this.config.pathPrefix || null;
			search.pathName = location.pathname;
			search.paraObj = {};
			if(prefix) {
				search.pathName = location.pathname.split(prefix)[1];
			}
			search.query = search.pathName + location.search;
			if(location.search) {
				search.paraObj = Base.unParam(location.search.substr(1));
			}
			return search;
		},
		getRootViewName : function() {
			var p2v = this.appConfig.pathViewMap, viewName;
			if(p2v[this.query.pathname]) {
				viewName = p2v[this.query.pathname];
			} else {
				viewName = p2v[this.appConfig.notFoundPath];
			}
			if(this.query.__view__) {
				viewName = this.query.__view__.split("-").join("/");
			}
			//multipage
			if(this.config.multipage) {
				var schPath = p2v[this.query["sch:pathname"]];
				if( typeof schPath == "object") {
					viewName = schPath[this.query.pathname] || schPath[this.appConfig.notFoundPath];
				} else {
					document.body.id = "vc-root";
					viewName = schPath || this.appConfig.defaultRootViewName;
				}
				
			}
			return viewName;
		},
		createQueryModel : function() {
			return new Model(this.query);
		},
		changeQueryModel : function() {
			this._fixQueryModel(this.query);
			this.queryModel.set(this.query);
		},
		_fixQueryModel : function(query) {
			if(this.queryModel) {
				var k, old = this.queryModel.toJSON();
				for(k in old) {
					if(!( k in query)) {
						this.queryModel.unset(k, {
							silent : true
						});
					}
				}
			}
		},
		navigateTo:function(url){
			var np = Base.unParam(url);
			
            var v1 = S.clone(this.state.paraObj);
            delete v1.referrer;
            delete v1.pathname;
            delete v1.query;
            delete v1.postdata;
            var v2 = Base.mix(v1, np);
			for(var p in v2){
				if(!v2[p])delete v2[p];
			}
            var nps = Base.param(v2);
            //var nps = this.param(_.extend(_.clone(this.paraObj),np));
            this.goTo(this.state.pathName + "/" + nps);
		}
	};
	return iRouter;
});
define("magix/impls/template",function(require){
    var S=KISSY,
        Template={},
        tmpl;
    S.use('template',function(S,T){tmpl=T});
    Template.toHTML=function(ops){
        ops=this.processOptions(ops);
        return tmpl(ops.template).render(ops.data);
    };
    return Template;
});define("magix/impls/vframe", ["magix/base"], function(require) {
	var vframeTagName = "vframe";
	var Base=require("magix/base");
	var iVframe=function(){
		
	};
	Base.mix(iVframe,{
		tagName:vframeTagName
	});
	Base.mix(iVframe.prototype,{
		getChildVframeNodes : function() {
			var node = document.getElementById(this.id);
			var nodes = node.getElementsByTagName(vframeTagName);
			var i, res = [];
			for( i = 0; i < nodes.length; i++) {
				res.push(this._idIt(nodes[i]));
			}
			return res;
		},
		getRouterObject:function(){
			var router;
			require.async("magix/router",function(r){
				router=r;
			});
			return router;
		},
		getVOMObject:function(){
			var vom;
			require.async("magix/vom",function(V){
				vom=V;
			});
			return vom;
		},
		createFrame:function(){
			return document.createElement(iVframe.tagName);
		}
	});
	return iVframe;
});
define("magix/impls/view", ["magix/vom", "magix/ajax", "magix/template", "magix/base"], function(require, exports, module) {
	var vom = require("magix/vom");
	var Base=require("magix/base");
	var ajax=require("magix/ajax");
	var template=require("magix/template");
	//var router=require("magix/router");
	var S=KISSY;
	var MVC;
	S.use('mvc',function(S,mvc){MVC=mvc});
	var iView=function(){
		iView.superclass.constructor.apply(this,arguments);
		
	};
	
	S.extend(iView,MVC.View,{
		initial:function(){
			this.delegateEvents();
		},
		getVOMObject:function(){
			return vom;
		},
		getAjaxObject:function(){
		    return ajax;
		},
		getTemplateObject:function(){
		    return template;
		},
		/*getRouterObject:function(){
		    return router;
		},*/
		dispose:function(){
		    iView.superclass.destroy.apply(this,arguments);
		    
		}
	});
	S.mix(iView.prototype,Base.Events);
	
	//让kissy中的事件传递给magix
    var oldFire=iView.prototype.fire;
    iView.prototype.fire=function(type,eventData){
        oldFire(type,eventData);
        this.trigger(type,eventData);
    }
	return iView;
});
define("magix/impls/vom", ["magix/base"], function(require) {
	var Base = require("magix/base");
	var iVOM = {
		setRootVframe : function() {
			var rootNode = null;
			if(document.body.id == "vf-root") {
				rootNode = document.body;
			}
			var rootVframe = this.createElement(rootNode, "vf-root");
			if(!rootNode) {
				document.body.insertBefore(rootVframe.getOnce(), document.body.firstChild);
			}
			this.root = rootVframe;
		}
	};
	return iVOM;
});/*
 * Magix:全局变量
 * 		init(config):启动Magix，原生代码，与Loader无关，
 * 			config:
 * 				magixHome:magix模块所在目录
 * 				appHome：app模块所在目录
 * 		setEnv：设置debug信息，package信息等，为Loader工作配置好路径
 * 		bootstrap：启动Router模块 真正开启Magix
 * 		implementBy：Magix实现底层依赖类库信息
 * 		version:版本号
 */
Magix = {
	init : function(config) {
		this.config = config;
		this.setEnv();
		this.bootstrap();
	},
	setEnv : function() {
		var alias={
			magix:this.config.magixHome,
			app:this.config.appHome
		};
		if(alias.magix&&!/\/$/.test(alias.magix)){
			alias.magix+='/';
			this.config.magixHome=alias.magix;
		}
		if(alias.app&&!/\/$/.test(alias.app)){
			alias.app+='/';
			this.config.appHome=alias.app;
		}
		if(this.config.debug)this.dev=true;
		if(!this.dev){
			delete alias.magix;
		}else{
			seajs.config({debug:2});
		}
		seajs.config({alias : alias});
		/*if(MxHistory && MxHistory.init) {
			MxHistory.init(this.config);
		}*/
	},
	bootstrap : function() {
		var self = this;
		KISSY.use(['mvc','ajax','template'],function(){//seajs与kissy使用不同的加载机制，在需要Model时无法用seajs加载kissy中的mvc
			seajs.use(["magix/router"], function(Router) {
				
				Router.init(self.config);
			});
		});
	},
	implementBy : "seajs-kissy",
	version : "0.1.0",
	dev:''
};
define("magix/model", ["magix/impls/model", "magix/base"], function(require) {
	var impl = require("magix/impls/model");
	var Base = require("magix/base");
	var Model;
	eval(Base.include("tmpls/model"));
	return Base.implement(Model,impl);
});define("magix/router",["magix/impls/router","magix/base"],function(require){
	var impl = require("magix/impls/router");
	var Base = require("magix/base");
	var Router = {};
	eval(Base.include("tmpls/router"));
	return Base.implement(Router, impl);
});define("magix/template", ["magix/impls/template", "magix/base"], function(require) {
    var impl = require("magix/impls/template");
    var Base = require("magix/base");
    var Template;
    eval(Base.include("tmpls/template"));
    return Base.implement(Template,impl);
});define("magix/vframe", ["magix/impls/vframe", "magix/base"], function(require) {
	var Base = require("magix/base");
	var impl = require("magix/impls/vframe");
	var Vframe;
	eval(Base.include("tmpls/vframe"));
	var iVframe = Base.implement(Vframe,impl);
	return iVframe.init();
});define("magix/view", ["magix/impls/view","magix/base"], function(require, exports, module) {
	var impl = require("magix/impls/view");
	var Base=require("magix/base");
	var View;
	eval(Base.include("tmpls/view"));
	return Base.implement(View,impl);
});define("magix/vom", ["magix/impls/vom","magix/base","magix/vframe"], function(require) {
	var impl = require("magix/impls/vom");
	var Base = require("magix/base");
	var Vframe = require("magix/vframe");
	var VOM = {};
	eval(Base.include("tmpls/vom"));
	var iVom = Base.implement(VOM, impl);
	return iVom.init();
});