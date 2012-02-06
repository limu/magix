KISSY.add("magix/ajax",function(S,impl,Base){
    var Ajax;
    Ajax={
    defaultOptions:{//默认ajax请求参数
        dataType:'html',
        success:function(){},
        failure:function(){}
    },
    /*
     * 发送异步请求
     * 默认支持dataType url success failure 四个参数
     */
    send:Base.unimpl,
    /*
     * 处理请求的参数，方便在send方法中直接使用相应的属性，避免判断
     */
    processOptions:function(ops){
        var me=this;
        if(!ops)ops={};
        for(var p in me.defaultOptions){
            if(!ops[p])ops[p]=me.defaultOptions[p];
        }
        return ops;
    },
    /*
     * 获取模板内容
     */
    getTemplate:function(url,succ,fail){
        var me=this,data;
        if(!me.$cache)me.$cache={};
        data=me.$cache[url];
        if(data){
            if(data.succ&&Base.isFunction(succ)){
                succ(data.content);
            }else if(!data.succ&&Base.isFunction(fail)){
                fail(data.content);
            }
            return;
        }
        me.send({
            url:url,
            dataType:'html',
            success:function(data){
                me.$cache[url]={succ:true,content:data};
                if(Base.isFunction(succ)){
                    succ(data);
                }
            },
            failure:function(msg){
                me.$cache[url]={content:msg};
                if(Base.isFunction(fail)){
                    fail(msg);
                }
            }
        });
    }
};
    return Base.implement(Ajax,impl);
},{
    requires:["magix/impls/ajax","magix/base"]
});/*
 * magix/base:提供一些基础方法供各个模块使用
 * 其中mix,include,unimpl方法是模板模块与实现模块分离的基础,需最先定义在实现模块中
 * 		mix(r,s,ov,wl):将s的内容混入r，ov=true：覆盖,wl=undefined:白名单
 * 		include:仅开发时使用,讲template模块同名文件,通过xhr同步获取后eval执行
 * 		unimpl:一个固定函数,用作每个abstract方法的初始值,如果abstract方法未实现,调用这个会抛出异常
 */
KISSY.add("magix/base", function(S,impl) {
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
	/*
 * maigx/base template
 * 	concrete members:
 * 		extend:magix自用继承实现
 * 	abstract members:
 * 		iF:是否为函数
 * 		iA:是否为数组
 * 		iS:是否为字符串
 * 		iPO:是否为纯js对象
 */
Base.mix(Base, {
	isFunction : Base.unimpl,
	isArray : Base.unimpl,
	isString : Base.unimpl,
	isPlainObject : Base.unimpl,
	requireAsync:Base.unimpl,
	Events : Base.unimpl,
	_idCounter : 0,
	uniqueId : function(prefix) {
		var id = this._idCounter++;
		return prefix ? prefix + id : id;
	},
	extend : function(r, s, px, sx) {
		if(!s || !r) {
			return r;
		}
		var OP = Object.prototype, O = function(o) {
			function F() {
			}


			F.prototype = o;
			return new F();
		}, sp = s.prototype, rp = O(sp);
		r.prototype = rp;
		rp.constructor = r;
		r.superclass = sp;
		if(s !== Object && sp.constructor === OP.constructor) {
			sp.constructor = s;
		}
		if(px) {
			this.mix(rp, px);
		}
		if(sx) {
			this.mix(r, sx);//,false);
		}
		/*for(var p in rp){
			r.prototype[p]=rp[p];
		}*/
		return r;
		
	},
	param : function(o) {
		var res = [];
		for(var k in o) {
			if(o.hasOwnProperty(k)) {
				res.push(k + "=" + o[k]);
			}
		}
		return res.join("&");
	},
	unParam : function(s) {
		var paraArr = s.split("&");
		var kv, res = {};
		for(var i = 0; i < paraArr.length; i++) {
			kv = paraArr[i].split("=");
			if(kv[0]) {
				res[kv[0]] = kv[1] || "";
			}
		}
		return res;
	},
	mixClassStaticProps:function(aim,src){
		for(var p in src){
			if(src.hasOwnProperty(p) && p!='prototype'){
				aim[p]=src[p];
			}
		}
		return aim;
	},
	mixClassProtoProps:function(aim,src){
	    for(var p in src){
	        if(!aim[p] || aim[p]==Base.unimpl){
	            aim[p]=src[p];
	        }
	    }
	    return aim;
	},
	implement:function(tmpl,impl){
		if(Base.isFunction(tmpl)&&Base.isFunction(impl)){
			impl.prototype.constructor = impl;
			var finalClass = function(){
				impl.apply(this,arguments);
				tmpl.apply(this,arguments);
				if(tmpl.prototype.initial){
					tmpl.prototype.initial.apply(this,arguments);
				}
				if(impl.prototype.initial){
					impl.prototype.initial.apply(this,arguments);
				}
			};
			//
			this.mixClassStaticProps(finalClass,tmpl);
			this.mixClassStaticProps(finalClass,impl);
			//
			this.mixClassProtoProps(finalClass.prototype,tmpl.prototype);
			this.mixClassProtoProps(finalClass.prototype,impl.prototype);
			//
			finalClass.prototype.constructor = finalClass;
			return finalClass;
		}else{
			var finalObject={};
			Base.mix(finalObject,tmpl);
			Base.mix(finalObject,impl);
			return finalObject;
		}
	}
});

	Base.mix(Base, impl);
	return Base;
},{
	requires:["magix/impls/base"]
});
KISSY.add("magix/impls/ajax",function(S,io){
    var Ajax={};
    Ajax.send=function(ops){
        ops=this.processOptions(ops);
        io({
            url:ops.url,
            dataType:ops.dataType,
            success:function(data){
                ops.success(data);
            },
            error:function(msg){
                ops.failure(msg);
            }
        });
    };
    return Ajax;
},{
    requires:["ajax"]
})
//implement base.js
KISSY.add("magix/impls/base",function(S,io) {
	//
	var toString=Object.prototype.toString;
	var iBase = {
		isFunction :S.isFunction,
		isArray : S.isArray,
		isString : S.isString,
		isPlainObject : function(o) {
			return o && toString.call(o) === '[object Object]' && !o.nodeType && !o.setInterval;
		},
		requireAsync : function(modName, fn) {
			S.use(modName,function(S,View){//keep as seajs require.sync
				fn(View);
			});
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
},{
	requires:["ajax"]
});//implement model
KISSY.add("magix/impls/model",function(S,MVC,Base){
	var iModel=MVC.Model;
	S.mix(iModel.prototype,Base.Events);
	//
	//让kissy中的事件传递给magix
	var oldFire=iModel.prototype.fire;
	iModel.prototype.fire=function(type,eventData){
	    oldFire(type,eventData);
	    this.trigger(type,eventData);
	}
	return iModel;
},{
	requires:["mvc","magix/base"]
});//implement router
KISSY.add("magix/impls/router",function(S,Base,Model,VOM,MVC,appConfig){
	var iRouter = {
		getAppConfig : function() {
			var p2v = appConfig.pathViewMap,
				dViewName=appConfig.defaultViewName;
			if(dViewName && p2v) {
				for(var k in p2v) {
					if(!p2v[k]) {
						p2v[k] = dViewName;
					}
				}
			}
			return appConfig;
		},
		setStateListener : function() {
			var self = this;
			var router = new MVC.Router();
			router.addRoutes({
				'*hash':function(s){
					S.log(s.hash);
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
		mountRootView : function() {
			var self = this;
			VOM.root.mountView(this.rootViewName, {
				queryModel : self.queryModel
			});
		}
	};
	return iRouter;
},{
	requires:["magix/base","magix/model","magix/vom","mvc","app/config/ini"]
});KISSY.add("magix/impls/template",function(S,T){
    var iTemplate={
        toHTML:function(ops){
            ops=this.processOptions(ops);
            return T(ops.template).render(ops.data);
        }
    };
    return iTemplate;
},{
    requires:["template"]
});
//implement vframe
KISSY.add("magix/impls/vframe",function(S,Base){
	var vframeTagName = "vframe";
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
		createFrame:function(){
			return document.createElement(iVframe.tagName);
		}
	});
	return iVframe;
},{
	requires:["magix/base"]
});
//view
KISSY.add("magix/impls/view",function(S,MVC,T,ajax,VOM,Base){
	//
	var iView=function(){
		iView.superclass.constructor.apply(this,arguments);
		
	};
	var templates={};
	S.extend(iView,MVC.View,{
		initial:function(){
			this.delegateEvents();
		},
	    getVOMObject:function(){
            return VOM;
        },
        getAjaxObject:function(){
            return ajax;
        },
        getTemplateObject:function(){
            return T;
        },
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
},{
	requires:["mvc","magix/template","magix/ajax","magix/vom","magix/base"]
})
//implement vom
KISSY.add("magix/impls/vom",function(S,Base){
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
},{
	requires:["magix/base"]
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
		this.config = config||{};
		this.setEnv();
		this.bootstrap();
	},
	setEnv : function() {
		var me = this,
			magixHome = me.config.magixHome||'',
			appHome = me.config.appHome||'',
			S=KISSY;
		if(me.dev){
			S.config({
				packages:[{
					name:'magix',
					path:magixHome+"../",
					tag:new Date().getTime()
				},{
					name:'app',
					path:appHome+"../",
					tag:new Date().getTime()
				}]
			});
		}
	},
	bootstrap : function() {
		var self = this;
		KISSY.use("magix/router",function(S,Router){
			Router.init(self.config);
		});
	},
	implementBy : "kissy",
	version : "0.1.0",
	dev:''
};
//
KISSY.add("magix/model",function(S,impl,Base){
	var Model;
	/*
 * 
 */
Model=function(){
	
};
	return Base.implement(Model,impl);
},{
	requires:["magix/impls/model","magix/base"]
});if(!window.console) {
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
};// magix router
KISSY.add("magix/router",function(S,impl,Base){
	var Router = {};
	Base.mix(Router, {
	//props
	config : null,
	appConfig : null,
	state : null,
	search : null,
	query : null,
	queryModel : null,
	rootViewName : null,
	oldRootViewName : null,
	postData : null,
	_locator : null,
	//abstract members
	getAppConfig : Base.unimpl,
	setStateListener : Base.unimpl,
	parseState : Base.unimpl,
	parseSearch : Base.unimpl,
	getRootViewName : Base.unimpl,
	createQueryModel : Base.unimpl,
	changeQueryModel : Base.unimpl,
	mountRootView:Base.unimpl,
	////todo goTo navigateTo setPostData
	navigateTo:Base.unimpl,
	goTo:Base.unimpl,
	setPostData:Base.unimpl,
	//concrete members
	init : function(config) {
		this.config = config;
		this.appConfig = this.getAppConfig();
		this.setStateListener();
	},
	route : function(stateString) {
		
		this.state = this.parseState(stateString);
		this.search = this.parseSearch();
		this._locator = {
			state : this.state,
			search : this.search
		};
		this.query = this._spreadLocator();
		this.oldRootViewName = this.rootViewName;
		this.rootViewName = this.getRootViewName();
		if(this.rootViewName == this.oldRootViewName) {
			this.changeQueryModel();
		}else{
			this.queryModel = this.createQueryModel();
			this.mountRootView();
		}
		this.postData = null; //todo re-think postData
	},
	_spreadLocator : function() {
		var query = {};
		var locator = this._locator;
		Base.mix(query, locator.state.paraObj);
		Base.mix(query, {
			referrer : locator.state.referrer,
			query : locator.state.query,
			pathname : locator.state.pathName,
			postdata : locator.state.postData || null //todo postdata
		});
		var multipageQuery = {}, schKey, schPara = locator.search.paraObj;
		if(this.config.multipage || true) {//todo del ||true
			multipageQuery["sch:pathname"] = locator.search.pathName;
			multipageQuery["sch:query"] = locator.search.query;
			for(schKey in schPara) {
				multipageQuery["sch:" + schKey] = schPara[schKey];
			}
			Base.mix(query, multipageQuery);
		}
		return query;
	}
});

	Base.mix(Router, impl);
	return Router;
},{
	requires:["magix/impls/router","magix/base"]
});KISSY.add("magix/template",function(S,impl,Base){
    var Template;
    //模板
Template={
    /*
     * 默认参数
     */
    defaultOptions:{
        data:{},
        template:''
    },
    processOptions:function(ops){
        var me=this;
        for(var p in me.defaultOptions){
            if(!ops[p])ops[p]=me.defaultOptions[p];
        }
        return ops;
    },
    toHTML:Base.unimpl
};
    return Base.implement(Template,impl);
},{
    requires:["magix/impls/template","magix/base"]
});
//vframe
KISSY.add("magix/vframe",function(S,impl,Base){
	var Vframe;
	Vframe = function(node, id) {
	
};
Base.mix(Vframe, {
	tagName : Base.unimpl,
	uniqueId : function() {
		return Base.uniqueId("vf-");
	},
	init : function() {
		var _ie6_tag_hack = document.createElement(this.tagName);
		_ie6_tag_hack = null;
		return this;
	}
});
Base.mix(Vframe.prototype, Base.Events);
Base.mix(Vframe.prototype, {
	getChildVframeNodes : Base.unimpl,
	/*
	 * 无法放到Vframe中，因为Vframe的tagName未实现，也不会实现，
	 * 原来的实现方案是把tagName覆盖掉，这是不正确的
	 * 模板方法类中的方法应该一直保持原样，实现类中也应该保持原样
	 * 谁也不应该被改写
	 */
	createFrame:Base.unimpl,
	initial : function(node, id) {
		//
		this.id = "";
		this.parentNode = null;
		this.childNodes = [];
		this.mounted = false;
		//
		this._domNode = node || this.createFrame();
		this.id = this._idIt(this._domNode, id);
		if(node) {
			this._domNode = null;
			node = null;
		}
		
	},
	_idIt : function(node, id) {
		node.id = (node && node.id) || id || Vframe.uniqueId();
		var _id = node.id;
		node = null;
		return _id;
	},
	getOnce : function() {
		var node = this._domNode;
		if(!node) {
			
		}
		this._domNode = null;
		return node;
	},
	getAttribute : function(s) {
		var node = document.getElementById(this.id);
		return node.getAttribute(s) || "";
	},
	setAttribute : function(k, v) {
		var node = document.getElementById(this.id);
		return node.setAttribute(k, v);
	},
	appendChild : function(c) {
		this.childNodes.push(c);
		c.parentNode = this;
	},
	getElements : function() {
		return this.getChildVframeNodes();
	},
	handelMounted : function() {
		if(this.view.rendered) {
			this.mounted = true;
			this.trigger("mounted", this.view);
		} else {
			this.view.bind("rendered", function() {
				this.mounted = true;
				this.trigger("mounted", this.view);
			});
		}
	},
	mountView : function(viewName, options) {
		if(!viewName) {
			return;
		}
		
		if(this.view) {
			this.view.destroy();
		}
		//
		var self = this;
		options = options || {};
		//
		Base.requireAsync(viewName, function(View) {
			
			options.vcid = self.id;
			options.viewName = viewName;
			//options.el = self.id;
			//options.id = self.id;
			self.view = new View(options);
			//self.view.vc = self;
			self.handelMounted();
		});
	},
	unmountView : function() {
		
		
		this.view.trigger("unload");
		
		document.getElementById(this.view.vcid).innerHTML = "";
		
		if(this.view.events) {
			var node = document.getElementById(this.id);
			for(var eventType in this.view.events) {
				node["on" + eventType] = null;
			}
			node = null;
		}
		
		this.mounted = false;
		this.view = null;
		//引用移除
	},
	removeNode : function() {
		
		if(this.mounted) {
			this.unmountView();
		}
		this.trigger("unload");
		
		var node = document.getElementById(this.id);
		if(node) {
			node.parentNode.removeChild(node);
			if(this.linkid) {
				node = document.getElementById(this.linkid);
				node.parentNode.removeChild(node);
			}
			node = null;
		}
		
		this.parentNode._removeChild(this);
	},
	_removeChild : function(child) {
		var i, n, newChildNodes = [];
		for( i = 0; i < this.childNodes.length; i++) {
			n = this.childNodes[i];
			if(n == child) {
				this._popFromVOM(n);
			} else {
				newChildNodes.push(n);
			}
		}
		this.childNodes = newChildNodes;
	},
	_popFromVOM : function(n) {
		Base.requireAsync("magix/vom", function(VOM) {
			VOM.pop(n);
		});
	}
});

	var iVframe = Base.implement(Vframe,impl);
	return iVframe.init();
},{
	requires:["magix/impls/vframe","magix/base"]
});//view
KISSY.add("magix/view",function(S,impl,Base){
	var View;
	/*
 * 关于destory和destory
 * backbone中model使用 destroy
 * kissy mvc中model view均使用destroy
 * 建议我们也使用destroy而非destory
 */
View = function() {
    
};
Base.mix(View.prototype, {
    render : Base.unimpl,
    getTemplate : Base.unimpl,
    getVOMObject : Base.unimpl,
    getTemplateObject : Base.unimpl,
    getAjaxObject : Base.unimpl,
    //getRouterObject:Base.unimpl,
    /*
     * 当view被destroy时，调用该方法，您可以在该方法内处理实现类中的相关销毁操作
     */
    dispose : Base.unimpl,
    queryModelChange : function() {

    },
    refresh : function() {

    },
    initial : function(o) {
        
        var self = this, vom = this.getVOMObject();
        
        this.subViewsChange = [];
        this.options = o;
        this.vcid = o.vcid;
        this.queryModel = o.queryModel;
        this.viewName = o.viewName;
        this.data = o.data || {};
        if(o.data && !Magix.config.multipage) {
            
        }
        if(o.message && typeof o.message == 'function') {
            this.bind("message", o.message);
        }
        /***********左莫增加标识符，用来判断当前view是否在vom节点中begin*************/
        this.exist = true;
        //监听unload事件
        this.bind("unload", function() {
            this.exist = false;
        });
        /***********左莫增加标识符，用来判断当前view是否在vom节点中end*************/
        this.bind("rendered", function() {
            this.trigger("beforeSubviewsRender");
            var vc = vom.getElementById(this.vcid);
            var childVcs = vc.getElements();
            var i, child;
            for( i = 0; i < childVcs.length; i++) {
                child = vom.createElement(childVcs[i]);
                vc.appendChild(child);
                child.mountView(child.getAttribute("view_name"), {
                    queryModel : this.queryModel
                });
            }
        });
        var vc = vom.getElementById(this.vcid);
        if(vc == vom.root) {
            this.queryModel.bind("change", function() {
                
                var res = self.queryModelChange(this);
                self._changeChain(res, this);
            });
        }
        if(this.init) {
            this.init();
        }
        this.getTemplate(function(data) {
            self.template = data;
            
            var autoRendered = self.render();
            if(autoRendered !== false) {
                self.trigger("rendered");
            }
        });
    },
    _queryModelChange : function(model) {
        
        var res = this.queryModelChange(model);
        this._changeChain(res, model);
    },
    _changeChain : function(res, model) {
        var vcs = [], i, vom = this.getVOMObject();
        var vc = vom.getElementById(this.vcid);
        if(res === false) {
            return;
        }
        if(res === true || res === undefined) {
            vcs = vc.childNodes;
        } else if(Base.isArray(res)) {
            vcs = res;
        }
        for( i = 0; i < vcs.length; i++) {
            if(vcs[i].view) {
                vcs[i].view._queryModelChange(model);
            }
        }
    },
    destory : function() {
        
        this.destroy();
    },
    destroy : function() {
        var vcQueue, i, vom = this.getVOMObject();
        
        vcQueue = this.getDestoryQueue();
        
        for( i = vcQueue.length - 1; i > 0; i--) {
            vcQueue[i].removeNode();
        }
        
        var root = vom.getElementById(this.vcid);
        root.unmountView();
        
        this.dispose();
    },
    getDestoryQueue : function() {
        var queue = [], vom = this.getVOMObject();
        var root = vom.getElementById(this.vcid);

        function rc(e) {
            var i;
            queue.push(e);
            for( i = 0; i < e.childNodes.length; i++) {
                rc(e.childNodes[i]);
            }
        }

        rc(root);
        
        return queue;
    },
    setData : function(data) {
        this.data = data;
        for(var k in data) {
            if(data[k].toJSON) {
                data[k] = data[k].toJSON();
            }
        }
        data.query = this.queryModel.toJSON();
        this.setRenderer();
    },
    setRenderer : function() {
        var self = this, rr = this.renderer, mcName, wrapperName;
        if(rr) {
            for(mcName in rr) {
                for(wrapperName in rr[mcName]) {(function() {
                        var mn = mcName, wn = wrapperName;
                        var fn = rr[mn][wn];
                        self.data[mn + "_" + wn] = function() {
                            return fn.call(this, self, mn);
                        };
                    })();
                }
            }
        }
    },
    /**
     * 所有事件处理函数
     * TODO:细化方法使用
     * @property events
     */
    delegateEvents : function() {
        var events = this.events, evtLevel = this.eventsLevel;
		var vom=this.getVOMObject();
        var node = document.getElementById(this.options.vcid);
        for(var _type in events) {(function() {
                var type = _type, mxType = 'mx' + type;

                node["on" + type] = function() {
                    var event = arguments[0] || window.event;
                    var target = event.target || event.srcElement;
                    var root = this;
                    // check if target is a textnode (safari)
                    if(target.nodeType === 3) {
                        target = target.parentNode;
                    }
                    var eventinfo = target.getAttribute(mxType);

                    // 根据evtLevel,回溯target
                    if(evtLevel)
                        var typeLv = evtLevel[type];
                    if(!eventinfo && typeLv) {
                        // 如果evtLevel是数字,逐级向上回溯
                        if(!isNaN(typeLv) && typeLv) {
                            while(typeLv && target != node) {
                                target = target.parentNode;
                                eventinfo = target.getAttribute(mxType);
                                if(eventinfo)
                                    break;
                                typeLv--;
                            }
                        } else if(typeLv.split('.')[1]) {
                            // 如果是className,直接向上寻找有这个className的父级
                            typeLv = typeLv.split('.')[1];
                            while(target != node) {
                                target = target.parentNode;
                                if(target.className.indexOf(typeLv) >= 0) {
                                    eventinfo = target.getAttribute(mxType);
                                    break;
                                }
                            }
                        } else if(typeLv.split('#')[1]) {
                            // 如果是id,直接向上寻找有这个id的父级
                            typeLv = typeLv.split('#')[1];
                            while(target != node) {
                                target = target.parentNode;
                                if(target.id == typeLv) {
                                    eventinfo = target.getAttribute(mxType);
                                    break;
                                }
                            }
                        }
                    } else if(!eventinfo) {
                        // 如果没有设置eventsLevel且没有找到eventinfo, 默认向上寻找一级
                        target = target.parentNode;
                        eventinfo = target.getAttribute(mxType);
                    }

                    if(eventinfo) {
                        var events = eventinfo.split("|"), eventArr, eventKey;
                        var vc = vom.getElementById(root.id);
                        var view = vc.view;
                        for(var i = 0; i < events.length; i++) {
                            eventArr = events[i].split(":");
                            eventKey = eventArr.shift();

                            // 事件代理,通过最后一个参数,决定是否阻止事件冒泡和取消默认动作
                            var evtBehavior = eventArr[eventArr.length - 1], evtArg = false;
                            if(evtBehavior == '_halt_' || evtBehavior == '_preventDefault_') {
                                event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                                evtArg = true;
                            }
                            if(evtBehavior == '_halt_' || evtBehavior == '_stop_') {
                                event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
                                evtArg = true;
                            }
                            if(evtArg) {
                                eventArr.pop();
                            }
                            if(view.events && view.events[type] && view.events[type][eventKey]) {
                                view.events[type][eventKey](view, view.idIt(target), eventArr);
                            }
                        }
                    }
                    target = null;
                    root = null;
                };
            })();
        }
    },
    render : function() {
        if(this.preventRender) {
            this.rendered = true;
            return true;
        }
        
        var node = document.getElementById(this.vcid), templet = this.getTemplateObject();
        
        node.innerHTML = templet.toHTML({
            template : this.template,
            data : {
                data : this.data,
                queryModel : this.queryModel.toJSON()
            }
        });
        this.rendered = true;
    },
    getTemplate : function(cb, name) {
        if(this.preventRender) {
            cb();
            return;
        }
        //var router=this.getRouterObject();
        var url = Magix.config.appHome + this.viewName.split("app")[1];
        if(name) {
            url = url + "." + "name" + ".html";
        } else {
            url = url + ".html";
        }
        var ajax = this.getAjaxObject();
        ajax.getTemplate(url, function(data) {
            
            cb(data);
        }, function(msg) {
            cb(msg);
        });
    },
    idIt : function(node) {
        var id = "";
        if(!node.id) {
            node.id = Base.uniqueId("mxevt-");
        }
        id = node.id;
        node = null;
        return id;
    }
});

	return Base.implement(View,impl);
},{
	requires:["magix/impls/view","magix/base"]
});//vom
KISSY.add("magix/vom",function(S,impl,Base,Vframe){
	var VOM = {};
	Base.mix(VOM, {
	_idMap : {},
	root : null,
	setRootVframe : Base.unimpl,
	init : function() {
		this.setRootVframe();
		return this;
	},
	push : function(vc) {
		this._idMap[vc.id] = vc;
	},
	pop : function(vc) {
		delete this._idMap[vc.id];
	},
	createElement : function(ele, id) {
		if(Base.isString(ele)) {
			ele = document.getElementById(ele);
		}
		var vc = new Vframe(ele, id);
		this.push(vc);
		return vc;
	},
	getElementById : function(id) {
		return this._idMap[id] || null;
	}
});

	Base.mix(VOM, impl);
	return VOM.init();
},{
	requires:["magix/impls/vom","magix/base","magix/vframe"]
});
