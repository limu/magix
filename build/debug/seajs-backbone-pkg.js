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
define("magix/impls/ajax",["jquery"],function(require){
    var Ajax={},
        jQuery=require("jquery");
    Ajax.send=function(ops){
		var me=this;
        ops=me.processOptions(ops);
		var oldSucc=ops.success,
			oldErr=ops.error;
        jQuery.ajax(Base.mix(ops,{
            url:ops.url,
            dataType:ops.dataType,
			type:ops.method,
            success:function(data,textStatus,jqXHR){
				me.fireGlobalSetting(jqXHR);
                 oldSucc.call(ops,data);
            },
            error:function(jqXHR, textStatus, errorThrown){
				me.fireGlobalSetting(jqXHR);
                oldErr.call(ops,textStatus);
            }
        }));
    }
    return Ajax;
});
define("magix/impls/base", ["backbone"], function(require) {
	var Backbone = require("backbone"),
		toString=Object.prototype.toString;
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
			
			require.async(modName, fn);
		},
		Events : Backbone.Events
	};
	return iBase;
});
define("magix/impls/model", ["backbone"], function(require) {
	var Backbone = require("backbone");
	var iModel = Backbone.Model;
	iModel.prototype.load=function(){
		this.fetch.apply(this,arguments);
	};
	return iModel;
});define("magix/impls/router", ["magix/base", "magix/model", "magix/vom", "app/config/ini","underscore"], function(require) {
	var Base = require("magix/base");
	var Model = require("magix/model");
	var VOM = require("magix/vom");
	var appConfig = require("app/config/ini");
	var _=require("underscore");
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
			var self = this;
			MxHistory.setHashListener(function(hash) {
				
				self.route(hash);
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
		navigateTo: function(q){
            var np = Base.unParam(q);
            var v1 = _.clone(this.state.paraObj);
            delete v1.referrer;
            delete v1.pathname;
            delete v1.query;
            delete v1.postdata;
            var v2 = _.extend(v1, np);
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
define("magix/impls/template",["magix/mu"],function(require){
    var Template={};
    var Mustache = require("magix/mu");
    Template.toHTML=function(ops){
        ops=this.processOptions(ops);
        return Mustache.to_html(ops.template,ops.data);
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
define("magix/impls/view", ["backbone","magix/vom", "magix/ajax", "magix/template"], function(require, exports, module) {
	var vom = require("magix/vom");
	var ajax = require("magix/ajax");
	var Backbone=require("backbone");
	var template = require("magix/template");
	
	var iView = Backbone.View.extend({
		getVOMObject:function(){
            return vom;
        },
        getAjaxObject:function(){
            return ajax;
        },
        getTemplateObject:function(){
            return template;
        },
        dispose:function(){

        }
	});
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
		if(MxHistory && MxHistory.init) {
			MxHistory.init(this.config);
		}
	},
	bootstrap : function() {
		var self = this;
		seajs.use(["magix/router"], function(Router) {
			
			Router.init(self.config);
		});
	},
	implementBy : "seajs-backbone-jquery",
	version : "0.3.0",
	dev:''
};
define("magix/model", ["magix/impls/model", "magix/base"], function(require) {
	var impl = require("magix/impls/model");
	var Base = require("magix/base");
	var Model;
	eval(Base.include("tmpls/model"));
	return Base.implement(Model,impl);
});/**
 * Magix扩展的Mustache
 * @module mu
 * @require mustache
 */
/**
 * 扩展的Mustache类<br/>
 * 支持简单的条件判断 如:
<pre>
{{#list}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==P)}}ID:{{id}},status:&lt;b style='color:green'>通过&lt;/b>{{/if(status==P)}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==W)}}ID:{{id}},status:等待{{/if(status==W)}}
&nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==R)}}ID:{{id}},status&lt;b style='color:red'>拒绝&lt;/b>{{/if(status==R)}}
{{/list}}
</pre>
 * 对于数组对象可以通过{{__index__}}访问数组下标
 * @class Mu
 * @namespace libs.magix
 * @static*/
define("magix/mu",["mustache"],function(require){
    var Mustache = require("mustache");
    function addFns(template, data){
        var ifs = getConditions(template);
        var key = "";
        for (var i = 0; i < ifs.length; i++) {
            key = "if(" + ifs[i] + ")";
            if (data[key]) {
                continue;
            }
            else {
                data[key] = buildFn(ifs[i]);
            }
        }
    }
    function getConditions(template){
        var ifregexp_ig = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/ig;
        var ifregexp_i = /\{{2,3}[\^#]?if\((.*?)\)\}{2,3}?/i;
        var gx = template.match(ifregexp_ig);
        var ret = [];
        if (gx) {
            for (var i = 0; i < gx.length; i++) {
                ret.push(gx[i].match(ifregexp_i)[1]);
            }
        }
        return ret;
    }
    function buildFn(key){
        key = key.split("==");
        var res = function(){
            var ns = key[0].split("."), value = key[1];
            var curData = this;
            for (var i = ns.length - 1; i > -1; i--) {
                var cns = ns.slice(i);
                var d = curData;
                try {
                    for (var j = 0; j < cns.length - 1; j++) {
                        d = d[cns[j]];
                    }
                    if (cns[cns.length - 1] in d) {
                        if (d[cns[cns.length - 1]].toString() === value) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                } 
                catch (err) {
                }
            }
            return false;
        };
        return res;
    }
    function findArray(o, depth){
        var k, v;
        for (k in o) {
            v = o[k];
            if (v instanceof Array) {
                addArrayIndex(v);
            }
            else 
                if (typeof(v) == "object" && depth < 5) {
                    findArray(v, depth + 1);
                }
        }
    }
    function addArrayIndex(v){
        for (var i = 0; i < v.length; i++) {
            o = v[i];
            if (typeof(o) == "object") {
                if (i === 0) {
                    o.__first__ = true;
                }
                else 
                    if (i == (v.length - 1)) {
                        o.__last__ = true;
                    }
                    else {
                        o.__mid__ = true;
                    }
                o.__index__ = i;
            }
        }
    }
    return {
        /**
         * 输出模板和数据,返回渲染后结果字符串,接口与Mustache完全一致
         * @method to_html
         * @param {String} template 模板字符串
         * @param {Object} data 数据Object
         * @return {String}
         */
        to_html: function(template, data){
            if (typeof(data) == "object") {
                findArray(data, 0);
            }
            addFns(template, data);
            return Mustache.to_html.apply(this, arguments);
        }
    };
});


if(!window.console) {
	window.console = {
		log : function(s) {
		},
		dir : function(s) {
		},
		warn : function(s) {
		},
		error : function(s) {
		}
	};
}
MxHistory = {
	config : {},
	hash : "",
	oldHash : null,
	showIframe : false,
	isIE : false,
	iframe : null,
	slient : false,
	interval : 50,
	intervalId : 0,
	iframeSrc : "",
	ready : false,
	hashListener : null,
	currentHash : "",
	init : function(config) {
		config = config || {};
		this.iframeSrc = config.iframeSrc || "mxhistory.html";
		this.config = config;
		this.hash = location.hash;
		this.oldHash = this.hash;
		this.isIE = navigator.userAgent.toLowerCase().indexOf("msie") > -1;
		var docMode = document.documentMode;
		this.showIframe = this.isIE && (!docMode || docMode < 8);
		this.wirteFrame(this.iframeSrc);
		this.regHashChange();
		if(!this.showIframe) {
			this.route(this.hash);
		}
	},
	regHashChange : function() {
		var self = this;
		if('onhashchange' in window && !this.showIframe) {
			window.onhashchange = function() {
				self.hashChange.call(self);
			};
		} else {
			this.intervalId = window.setInterval((function() {
				var hash = location.hash;
				if(hash != self.oldHash) {
					self.hashChange.call(self);
				}
			}), this.interval);
		}
	},
	hashChange : function() {
		this.hash = location.hash;
		this.oldHash = this.hash;
		if(!this.showIframe) {
			this.route(this.hash);
		} else {
			this.iframe.src = this.iframeSrc + "?" + (this.hash ? this.hash.substr(1) : "");
		}
	},
	frameLoad : function() {
		var h = Magix.History;
		if(h.iframe) {
			var ns = h.iframe.contentWindow.location.search.substr(1);
			h.hash = h.oldHash = "#" + ns;
			location.hash = ns;
		}
		this.route(this.hash);
	},
	route : function(hash) {
		if(hash.indexOf("?") === 0) {
			hash = hash.substr(1);
		}
		if(hash.indexOf("#") === 0) {
			hash = hash.substr(1);
		}
		if(hash.indexOf("!") === 0) {
			hash = hash.substr(1);
		}
		if(this.hashListener) {
			this.hashListener(hash);
		}
		this.ready = true;
		this.currentHash = hash;
	},
	wirteFrame : function() {
		var self = this;
		if(this.showIframe) {
			//document.write("<iframe onload='Magix.History.frameLoad();' id='MxHistory' src='" + this.iframeSrc + "?" + (this.hash ? this.hash.substr(1) : "") + "' width='90%'></iframe>");
			document.write("<iframe onload='Magix.History.frameLoad();' id='MxHistory' src='" + this.iframeSrc + "?" + (this.hash ? this.hash.substr(1) : "") + "' style='z-index:99998;visibility:hidden;position:absolute;' border='0' frameborder='0' marginwidth='0' marginheight='0' scrolling='no' ></iframe>");
		}
		window.setTimeout((function() {
			self.iframe = document.getElementById("MxHistory");
		}), 0);
	},
	setHashListener : function(fn) {
		this.hashListener = fn;
		if(this.ready) {
			fn(this.currentHash);
		}
	}
};define("magix/router",["magix/impls/router","magix/base"],function(require){
	var impl = require("magix/impls/router");
	var Base = require("magix/base");
	var Router = {};
	eval(Base.include("tmpls/router"));
	return Base.implement(Router, impl);
});
define("magix/template", ["magix/impls/template", "magix/base"], function(require) {
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