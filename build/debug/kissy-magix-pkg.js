KISSY.add("magix/ajax",function(S,impl,Base){
    var Ajax;
    Ajax = {
	defaultOptions : { //默认ajax请求参数
		dataType : 'html',
		type : 'POST',
		success : function () {},
		error : function () {}
	},
	/*
		ajax请求全局设置
		先支持statusCode={404:function(){},403:...};
	 */
	globalSetting : function (settings) {
		var me = this;
		if (!me.$globalSetting)
			me.$globalSetting = {};
		for (var p in settings) {
			me.$globalSetting[p] = settings[p];
		}
		return me.$globalSetting;
	},
	/*
	触发全局设置
	 */
	fireGlobalSetting : function (xhr) {
		var me = this,
			gSetting = me.$globalSetting,
			codes;
		if (gSetting && gSetting.statusCode) {
			codes = gSetting.statusCode;
			if (codes[xhr.status]) {
				try{
					codes[xhr.status](xhr);
				}catch(e){
					
				}
			}
		}
	},
	/*
	 * 发送异步请求
	 * 默认支持dataType url success error 四个参数
	 */
	send : Base.unimpl,
	/*
	 * 处理请求的参数，方便在send方法中直接使用相应的属性，避免判断
	 */
	processOptions : function (ops) {
		var me = this;
		if (!ops)
			ops = {};
		for (var p in me.defaultOptions) {
			if (!ops[p]){
				ops[p] = me.defaultOptions[p];
			}
		}
		return ops;
	},
	/*
	 * 获取模板内容
	 */
	getTemplate : function (url, succ, fail,viewName) {
		var me = this,
			tmplCaches=Magix.templates,
			data = tmplCaches[viewName];
		if (data) {
			if (Base.isFunction(succ)) {
				succ(data);
			}
			return;
		}
		me.send({
			url : url,
			dataType : 'html',
			type:'GET',
			success : function (data) {
				tmplCaches[viewName] = data;
				if (Base.isFunction(succ)) {
					succ(data);
				}
			},
			error : function (msg) {
				if (Base.isFunction(fail)) {
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
	requireAsync : Base.unimpl,
	Events : Base.unimpl,
	_idCounter : 0,
	uniqueId : function (prefix) {
		var id = this._idCounter++;
		return prefix ? prefix + id : id;
	},
	extend : function (r, s, px, sx) {
		if (!s || !r) {
			return r;
		}
		var OP = Object.prototype,
		O = function (o) {
			function F() {}			
			F.prototype = o;
			return new F();
		},
		sp = s.prototype,
		rp = O(sp);
		r.prototype = rp;
		rp.constructor = r;
		r.superclass = sp;
		if (s !== Object && sp.constructor === OP.constructor) {
			sp.constructor = s;
		}
		if (px) {
			this.mix(rp, px);
		}
		if (sx) {
			this.mix(r, sx); //,false);
		}
		/*for(var p in rp){
		r.prototype[p]=rp[p];
		}*/
		return r;
		
	},
	param : function (o) {
		var res = [];
		for (var k in o) {
			if (o.hasOwnProperty(k)) {
				res.push(k + "=" + o[k]);
			}
		}
		return res.join("&");
	},
	unParam : function (s) {
		var paraArr = s.split("&");
		var kv,
		res = {};
		for (var i = 0; i < paraArr.length; i++) {
			kv = paraArr[i].split("=");
			if (kv[0]) {
				res[kv[0]] = kv[1] || "";
			}
		}
		return res;
	},
	mixClassStaticProps : function (aim, src) {
		for (var p in src) {
			if (src.hasOwnProperty(p) && p != 'prototype') {
				aim[p] = src[p];
			}
		}
		return aim;
	},
	mixClassProtoProps : function (aim, src) {
		for (var p in src) {
			if (!aim[p] || aim[p] == Base.unimpl) {
				aim[p] = src[p];
			}
		}
		return aim;
	},
	implement : function (tmpl, impl) {
		if (Base.isFunction(tmpl) && Base.isFunction(impl)) {
			impl.prototype.constructor = impl;
			var finalClass = function () {
				impl.apply(this, arguments);
				tmpl.apply(this, arguments);
				if (tmpl.prototype.initial) {
					tmpl.prototype.initial.apply(this, arguments);
				}
				if (impl.prototype.initial) {
					impl.prototype.initial.apply(this, arguments);
				}
			};
			//
			this.mixClassStaticProps(finalClass, tmpl);
			this.mixClassStaticProps(finalClass, impl);
			//
			this.mixClassProtoProps(finalClass.prototype, tmpl.prototype);
			this.mixClassProtoProps(finalClass.prototype, impl.prototype);
			//
			finalClass.prototype.constructor = finalClass;
			return finalClass;
		} else {
			var finalObject = {};
			Base.mix(finalObject, tmpl);
			Base.mix(finalObject, impl);
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
		var me=this;
        ops=this.processOptions(ops);
		var oldSucc=ops.success,
			oldErr=ops.error;
        io(S.mix(ops,{
            url:ops.url,
            dataType:ops.dataType,
			type:ops.type,
            success:function(data,textStatus,xhr){
				me.fireGlobalSetting(xhr);
                oldSucc.call(ops,data);
            },
            error:function(data,textStatus,xhr){
				me.fireGlobalSetting(xhr);
                oldErr.call(ops,textStatus);
            }
        }));
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
			trigger : function(eventName,fireOnce) {
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
				if(fireOnce==true){
					delete calls[eventName];
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
		if(type.charAt(0)=='*'){//这。。我想跳河了。。。
			var self=this;
			type=type.substring(1).replace(/[A-Z]/,function(m){//第一个大写字母转小写
				return m.toLowerCase();
			});
			if(!self.__propCache)self.__propCache={};
			S.each(eventData.attrName,function(v){
				self.__propCache[v]=true;
			});
			this.trigger(type,eventData);			
			delete this.__propCache;
		}else{
			this.trigger(type,eventData);
		}
		
	};
	iModel.prototype.hasChanged=function(prop){
		var _vs=this.__propCache;
		if(_vs){
			return _vs[prop];
		}
		return false;
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
},{
	requires:["mvc","magix/base"]
});//implement router
KISSY.add("magix/impls/router",function(S,Base,Model,VOM,MVC,appConfig){
	var QueryModel=function(){

	};

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
		getVOMObject:function(){
			return VOM;
		},
		setStateListener : function() {
			var self = this;
			VOM.__Router=self;
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
				if(paraStr.indexOf('=')==-1&&paraStr){
					tmpArr.push(paraStr);
					paraStr='';
				}
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
			if(p2v){
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
			var np;
			if(Base.isPlainObject(url)){
				np=url;
			}else{
				np = Base.unParam(url);
			}
			
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
},{
	requires:["magix/base","magix/model","magix/vom","mvc","app/config/ini"]
});KISSY.add("magix/impls/template",function(S,Tmpl){
    var iTemplate={
        toHTML:function(ops){
            ops=this.processOptions(ops);
            return Tmpl.toHTML(ops.template,ops.data);
        }
    };
    return iTemplate;
},{
    requires:["magix/tmpl"]
});//implement vframe
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

	var ex=function(props,staticProps){
		var fn=function(){
			fn.superclass.constructor.apply(this,arguments);
		}
		fn.extend=ex;
		return S.extend(fn,this,props,staticProps);
	};

	iView.extend=ex;

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
KISSY.add("magix/impls/vom",function(S,Base,Vframe){
	var iVOM = {
		setRootVframe : function() {
			var rootNode = document.getElementById('vf-root'),
				rootVframe = this.createElement(rootNode, "vf-root");
			if(!rootNode) {
				document.body.insertBefore(rootVframe.getOnce(), document.body.firstChild);
			}
			this.root = rootVframe;
		},
		getVframeClass:function(){
			return Vframe;
		}
	};
	return iVOM;
},{
	requires:["magix/base","magix/vframe"]
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
	_fireGlobalListen:function(key,from,to){
		var me=this,
			list=me.$globalList;
		if(list&&list.length){
			for(var i=0;i<list.length;i++){
				try{
					list[i]({
						key:key,
						from:from,
						to:to
					});
				}catch(e){

				}
			}
		}
	},
	setGlobal:function(key,value){
		var me=this;
		if(!me.$global)me.$global={};
		var old=me.$global[key];
		me.$global[key]=value;
		me._fireGlobalListen(key,old,value);
	},
	delGlobal:function(key){
		var me=this;
		if(me.$global){
			var old=me.$global[key];
			delete me.$global[key];
			me._fireGlobalListen(key,old);
		}
	},
	getGlobal:function(key){
		var me=this;
		if(me.$global){
			return me.$global[key];
		}
		return null;
	},
	listenGlobal:function(fn){
		var me=this;
		if(!me.$globalList)me.$globalList=[];
		me.$globalList.push(fn);
	},
	unlistenGlobal:function(fn){
		var me=this,
			list=me.$globalList;
		if(list&&list.length){
			for(var i=0;i<list.length;i++){
				if(list[i]==fn){
					list.splice(i,1);
					break;
				}
			}
		}
	},
	templates:{},//模板缓存，方便打包
	setEnv : function() {
		var me = this,
			magixHome = me.config.magixHome||'',
			appHome = me.config.appHome||'',
			S=KISSY,
			now=new Date().getTime();

		if(magixHome&&!/\/$/.test(magixHome)){
			magixHome+='/';
			this.config.magixHome=magixHome
		}
		if(appHome&&!/\/$/.test(appHome)){
			appHome+='/';
			this.config.appHome=appHome;
		}

		if(!this.config.release&&/^https?:\/\//.test(appHome)){
			this.config.release= appHome.indexOf(location.protocol+'//'+location.host)==-1;
		}

		if(!this.config.release){
			var reg=new RegExp("("+appHome+".+)-min\\.js(\\?[^?]+)?");
			S.config({
				map:[[reg,'$1.js$2']]
			});
			me.dev=true;
			S.config({debug:true});
		}
		if(!window.console){
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
		S.config({
			packages:[{
				name:'magix',
				path:/\/magix\/$/.test(magixHome)?magixHome+"../":magixHome,
				tag:me.dev?now:'20120214'
			},{
				name:'app',//http://ad.com/ab/c/d/../  
				path:/\/app\/$/.test(appHome)?appHome+"../":appHome,
				tag:me.dev?now:'20120214'
			}]
		});
	},
	bootstrap : function() {
		var self = this;
		KISSY.use("magix/router",function(S,Router){
			S.log(Router);
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
 * model
 */
Model=function(){
	
};

Base.mix(Model.prototype,{
	//hasChanged:Base.unimpl,//某个属性是否发生了改变 
	//removeAttr:Base.unimpl,//删除属性
	unset:Base.unimpl,//删除属性
	clear:Base.unimpl,//清除所有的属性
	load:Base.unimpl//获取数据
});
	return Base.implement(Model,impl);
},{
	requires:["magix/impls/model","magix/base"]
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
KISSY.add("magix/mu",function(S,Mustache){
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
},{
	requires:["magix/mustache"]
});


KISSY.add("magix/mustache", function(S) {

	/*
	 mustache.js — Logic-less templates in JavaScript

	 See http://mustache.github.com/ for more info.
	 */

	var Mustache = function() {
		var Renderer = function() {
		};

		Renderer.prototype = {
			otag : "{{",
			ctag : "}}",
			pragmas : {},
			buffer : [],
			pragmas_implemented : {
				"IMPLICIT-ITERATOR" : true
			},
			context : {},

			render : function(template, context, partials, in_recursion) {
				// reset buffer & set context
				if(!in_recursion) {
					this.context = context;
					this.buffer = [];
					// TODO: make this non-lazy
				}

				// fail fast
				if(!this.includes("", template)) {
					if(in_recursion) {
						return template;
					} else {
						this.send(template);
						return;
					}
				}
				template = this.render_pragmas(template);
				var html = this.render_section(template, context, partials);
				if(in_recursion) {
					return this.render_tags(html, context, partials, in_recursion);
				}

				this.render_tags(html, context, partials, in_recursion);
			},
			/*
			 Sends parsed lines
			 */
			send : function(line) {
				if(line != "") {
					this.buffer.push(line);
				}
			},
			/*
			 Looks for %PRAGMAS
			 */
			render_pragmas : function(template) {
				// no pragmas
				if(!this.includes("%", template)) {
					return template;
				}

				var that = this;
				var regex = new RegExp(this.otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" + this.ctag);
				return template.replace(regex, function(match, pragma, options) {
					if(!that.pragmas_implemented[pragma]) {
						throw ( {
							message : "This implementation of mustache doesn't understand the '" + pragma + "' pragma"
						});
					}
					that.pragmas[pragma] = {};
					if(options) {
						var opts = options.split("=");
						that.pragmas[pragma][opts[0]] = opts[1];
					}
					return "";
					// ignore unknown pragmas silently
				});
			},
			/*
			 Tries to find a partial in the curent scope and render it
			 */
			render_partial : function(name, context, partials) {
				name = this.trim(name);
				if(!partials || partials[name] === undefined) {
					throw ( {
						message : "unknown_partial '" + name + "'"
					});
				}
				if( typeof (context[name]) != "object") {
					return this.render(partials[name], context, partials, true);
				}
				return this.render(partials[name], context[name], partials, true);
			},
			/*
			 Renders inverted (^) and normal (#) sections
			 */
			render_section : function(template, context, partials) {
				if(!this.includes("#", template) && !this.includes("^", template)) {
					return template;
				}

				var that = this;
				// CSW - Added "+?" so it finds the tighest bound, not the widest
				var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag + "\n*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag + "\\s*", "mg");

				// for each {{#foo}}{{/foo}} section do...
				return template.replace(regex, function(match, type, name, content) {
					var value = that.find(name, context);
					if(type == "^") {// inverted section
						if(!value || that.is_array(value) && value.length === 0) {
							// false or empty list, render it
							return that.render(content, context, partials, true);
						} else {
							return "";
						}
					} else if(type == "#") {// normal section
						if(that.is_array(value)) {// Enumerable, Let's loop!
							return that.map(value, function(row) {
								return that.render(content, that.create_context(row), partials, true);
							}).join("");
						} else if(that.is_object(value)) {// Object, Use it as subcontext!
							return that.render(content, that.create_context(value), partials, true);
						} else if( typeof value === "function") {
							// higher order section
							return value.call(context, content, function(text) {
								return that.render(text, context, partials, true);
							});
						} else if(value) {// boolean section
							return that.render(content, context, partials, true);
						} else {
							return "";
						}
					}
				});
			},
			/*
			 Replace {{foo}} and friends with values from our view
			 */
			render_tags : function(template, context, partials, in_recursion) {
				// tit for tat
				var that = this;

				var new_regex = function() {
					return new RegExp(that.otag + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" + that.ctag + "+", "g");
				};
				var regex = new_regex();
				var tag_replace_callback = function(match, operator, name) {
					switch(operator) {
						case "!":
							// ignore comments
							return "";
						case "=":
							// set new delimiters, rebuild the replace regexp
							that.set_delimiters(name);
							regex = new_regex();
							return "";
						case ">":
							// render partial
							return that.render_partial(name, context, partials);
						case "{":
							// the triple mustache is unescaped
							return that.find(name, context);
						default:
							// escape the value
							return that.escape(that.find(name, context));
					}
				};
				var lines = template.split("\n");
				for(var i = 0; i < lines.length; i++) {
					lines[i] = lines[i].replace(regex, tag_replace_callback, this);
					if(!in_recursion) {
						this.send(lines[i]);
					}
				}

				if(in_recursion) {
					return lines.join("\n");
				}
			},
			set_delimiters : function(delimiters) {
				var dels = delimiters.split(" ");
				this.otag = this.escape_regex(dels[0]);
				this.ctag = this.escape_regex(dels[1]);
			},
			escape_regex : function(text) {
				// thank you Simon Willison
				if(!arguments.callee.sRE) {
					var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
					arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
				}
				return text.replace(arguments.callee.sRE, '\\$1');
			},
			/*
			 find `name` in current `context`. That is find me a value
			 from the view object
			 */
			find : function(name, context) {
				name = this.trim(name);

				// Checks whether a value is thruthy or false or 0
				function is_kinda_truthy(bool) {
					return bool === false || bool === 0 || bool;
				}

				var value;
				if(is_kinda_truthy(context[name])) {
					value = context[name];
				} else if(is_kinda_truthy(this.context[name])) {
					value = this.context[name];
				}

				if( typeof value === "function") {
					return value.apply(context);
				}
				if(value !== undefined) {
					return value;
				}
				// silently ignore unkown variables
				return "";
			},
			// Utility methods

			/* includes tag */
			includes : function(needle, haystack) {
				return haystack.indexOf(this.otag + needle) != -1;
			},
			/*
			 Does away with nasty characters
			 */
			escape : function(s) {
				s = String(s === null ? "" : s);
				return s.replace(/&(?!\w+;)|["'<>\\]/g, function(s) {
					switch(s) {
						case "&":
							return "&amp;";
						case "\\":
							return "\\\\";
						case '"':
							return '&quot;';
						case "'":
							return '&#39;';
						case "<":
							return "&lt;";
						case ">":
							return "&gt;";
						default:
							return s;
					}
				});
			},
			// by @langalex, support for arrays of strings
			create_context : function(_context) {
				if(this.is_object(_context)) {
					return _context;
				} else {
					var iterator = ".";
					if(this.pragmas["IMPLICIT-ITERATOR"]) {
						iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator;
					}
					var ctx = {};
					ctx[iterator] = _context;
					return ctx;
				}
			},
			is_object : function(a) {
				return a && typeof a == "object";
			},
			is_array : function(a) {
				return Object.prototype.toString.call(a) === '[object Array]';
			},
			/*
			 Gets rid of leading and trailing whitespace
			 */
			trim : function(s) {
				return s.replace(/^\s*|\s*$/g, "");
			},
			/*
			 Why, why, why? Because IE. Cry, cry cry.
			 */
			map : function(array, fn) {
				if( typeof array.map == "function") {
					return array.map(fn);
				} else {
					var r = [];
					var l = array.length;
					for(var i = 0; i < l; i++) {
						r.push(fn(array[i]));
					}
					return r;
				}
			}
		};

		return ( {
			name : "mustache.js",
			version : "0.3.1-dev",

			/*
			 Turns a template and view into HTML
			 */
			to_html : function(template, view, partials, send_fun) {
				var renderer = new Renderer();
				if(send_fun) {
					renderer.send = send_fun;
				}
				
				renderer.render(template, view, partials);
				if(!send_fun) {
					return renderer.buffer.join("\n");
				}
			}
		});
	}();
	return Mustache;
});
// magix router
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
	////todo goTo navigateTo setPostData
	navigateTo:Base.unimpl,
	setPostData:Base.unimpl,
	getVOMObject:Base.unimpl,
	//concrete members
	init : function(config) {
		this.config = config;
		this.appConfig = this.getAppConfig();
		this.setStateListener();
	},
	goTo:function(url){
		
		location.hash='!'+url;
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
		if(this.rootViewName){
			if(this.rootViewName == this.oldRootViewName) {
				this.changeQueryModel();
			}else{
				var vom=this.getVOMObject();
				this.queryModel = this.createQueryModel();
				this.queryModel.bind("change", function() {
					vom.notifyQueryModelChange(this);
	            });
				
				vom.mountRootView(this.rootViewName,this.queryModel);
			}
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
KISSY.add("magix/tmpl",function(S){
	var fnCaches={},
		tmplCaches={},
		stack='_'+new Date().getTime(),
		notRender=/\s*<script[^>]+type\s*=\s*(['"])\s*text\/notRenderTemplate\1[^>]*>([\s\S]*?)<\/script>\s*/gi;
	var tmpl=function(template,data){
		if(template){
			var resultTemplate;
			resultTemplate=tmplCaches[template];
			if(!resultTemplate){
				resultTemplate=stack + ".push('" + template
				.replace(/\s+/g," ")
				.replace(/<#/g,"\r")
				.replace(/;*#>/g,"\n")
				.replace(/\\(?=[^\r\n]*\n)/g,"\t")
				.replace(/\\/g,"\\\\")
				.replace(/\t/g,"\\")
				.replace(/'(?=[^\r\n]*\n)/g,"\t")
				.replace(/'/g,"\\'")
				.replace(/\t/g,"'")
				.replace(/\r=([^\n]+)\n/g,"',$1,'")
				.replace(/\r/g,"');")
				.replace(/\n/g,";"+stack+".push('")+ "');return "+stack+".join('')";
				 tmplCaches[template]=resultTemplate;
			}
			var vars=[stack],values=[[]],fnKey;
			if(data){
				for(var p in data){
					vars.push(p.replace(/[:+\-*\/&^%#@!~]/g,'$'));
					values.push(data[p]);
				}
			}
			fnKey=vars.join('_')+'_'+resultTemplate;
			if(!fnCaches[fnKey]){
				try{
					fnCaches[fnKey]=new Function(vars,resultTemplate);
				}catch(e){
					
					return resultTemplate=e.message;
				}
			}
			try{
				resultTemplate=fnCaches[fnKey].apply(data,values);
			}catch(e){
				
				resultTemplate=e.message;
			}
			return resultTemplate;
		}
		return template;
	};
	return {
		toHTML:function(template,data){
			var notRenders=template.match(notRender);
			if(notRenders){
				template=template.replace(notRender,function(){//防止不必要的解析
					return '<script type="text/notRenderTemplate"></script>';
				});
				template=tmpl(template,data);
				var idx=0;
				template=template.replace(notRender,function(){
					return notRenders[idx++];
				});
			}else{
				template=tmpl(template,data);
			}
			return template;
		}
	};
});//vframe
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
	getRouterObject:function(){
		return this.__Router;
	},
	/*
	 * 无法放到Vframe中，因为Vframe的tagName未实现，也不会实现，
	 * 原来的实现方案是把tagName覆盖掉，这是不正确的
	 * 模板方法类中的方法应该一直保持原样，实现类中也应该保持原样
	 * 谁也不应该被改写
	 */
	createFrame:Base.unimpl,
	getVOMObject:function(){
		return this.__VOM;
	},
	initial : function(node, id) {
		//
		this.id = "";
		this.parentNode = null;
		this.childNodes = [];
		this.mounted = false;
		//
		this._domNode = node || this.createFrame();
		this.id = this._idIt(this._domNode, id);
		if(node) {//why?
			this._domNode = null;
			node = null;
		}
		this.exist=true;
		
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
		var me=this;
		if(me.view.rendered) {
			me.mounted = true;
			me.trigger("mounted", me.view);
			me.mountSubFrames();
		} else {
			me.view.bind("rendered", function() {
				me.mounted = true;
				me.trigger("mounted", me.view);
				me.mountSubFrames();
			});
		}
		me.view.bind("prerender",function(){
			me.destroySubFrames();
		});
	},
	mountSubFrames:function(){
		//this.trigger("beforeSubviewsRender");
		var vom=this.getVOMObject();
		var vc = vom.getElementById(this.view.vcid);
		var childVcs = vc.getElements();
		var i, child;
		for( i = 0; i < childVcs.length; i++) {
			child = vom.createElement(childVcs[i]);
			vc.appendChild(child);
			child.mountView(child.getAttribute("view_name"), {
				queryModel : this.view.queryModel
			});
		}
	},
	mountView : function(viewName, options) {
		if(!viewName) {
			return;
		}
		
		options = options || {};

		this.unmountView(options);//先清view

		/*if(this.view) {
			this.view.destroy();
		}*/
		//

		var self = this,router=this.getRouterObject();
		
		if(!options.queryModel){//确保每个view都有queryModel，请参考View的initial方法
			options.queryModel=router.queryModel;
		}
		//
		Base.requireAsync(viewName, function(View) {
			if(self.exist){
				
				options.vcid = self.id;
				options.viewName = viewName;
				//options.el = self.id;
				//options.id = self.id;
				self.view = new View(options);
				self.__viewLoaded=true;
				self.trigger('viewLoaded',true);
				//self.view.vc = self;
				self.handelMounted();
			}
		});
	},
	unmountView : function(options) {
		if(this.view&&this.mounted){
			
			
			
						
			
			options=options||{};
			this.destroySubFrames();
			this.view.trigger("unload",true);
			this.view.trigger("beforeRebuild",true);
			this.view.destroy();
			
			var node=document.getElementById(this.view.vcid),
				iframes=node.getElementsByTagName('iframe'),
				iframe, parent;
            while (iframes.length) {
                iframe = iframes[0];
                parent = iframe.parentNode;
                iframe.src = ''; // 似乎是关键步骤
                parent.removeChild(iframe);
                parent.parentNode.removeChild(parent);
                iframe = parent = null;
            }
			node.innerHTML = options.unmountPlaceholder||"";
			delete options.unmountPlaceholder;
			this.mounted = false;
			this.view = null;
		}
		//引用移除
	},
	destroySubFrames:function(){
		var queue = [], vom = this.getVOMObject();
        var root = vom.getElementById(this.id);

        function rc(e) {
            queue.push(e);
            for(var i = 0; i < e.childNodes.length; i++) {
                rc(e.childNodes[i]);
            }
        }

        rc(root);
        
		
		for(var i = queue.length - 1; i > 0; i--) {
            queue[i].removeNode();
        }
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
		var vom=this.getVOMObject();
		vom.pop(n);
		n.exist=false;
	},
	postMessage:function(data,from){
		var me=this;
		if(me.exist){
			if(!data)data={};
			data.from=from;
			if(me.__viewLoaded){
				me.view._receiveMessage(data);
			}else{
				me.unbind('viewLoaded');
				me.bind('viewLoaded',function(){
					me.view._receiveMessage(data);
				});
			}
		}
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
    getVOMObject: Base.unimpl,
    getTemplateObject: Base.unimpl,
    getAjaxObject: Base.unimpl,
    //getRouterObject:Base.unimpl,
    /*
     * 当view被destroy时，调用该方法，您可以在该方法内处理实现类中的相关销毁操作
     */
    dispose: Base.unimpl,
    queryModelChange: function() {

    },
    initial: function(o) {
        
        var self = this,
            vom = this.getVOMObject();
        
        //this.subViewsChange = []; 不理解的先去掉
        this.options = o;
        this.vcid = o.vcid;
        this.queryModel = o.queryModel;
        this.viewName = o.viewName;
        this.data = o.data || {};
        if (o.data && !Magix.config.multipage) {
            
        }
        if (o.message && typeof o.message == 'function') {
            this.bind("message", o.message);
        } /***********左莫增加标识符，用来判断当前view是否在vom节点中begin*************/
        this.exist = true;
        //监听unload事件
        this.bind("unload", function() {
            this.exist = false;
        }); /***********左莫增加标识符，用来判断当前view是否在vom节点中end*************/
/*this.bind("rendered", function() {
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
        });*/
/*var vf = vom.getElementById(this.vcid);
        if(vf == vom.root) {
            this.queryModel.bind("change", function() {
                
                var res = self.queryModelChange(this);
                self._changeChain(res, this);
            });
        }*/
        if (this.init) {
            setTimeout(function() { //确保内部的magix绑定的事件先执行，再调用init
                if(self.exist){
                    self.init(); //如果在init中绑定了事件，无setTimeout时，init中的绑定的事件早于magix中的，有可能出问题
                }
            }, 0);
        }
        if (!this.preventRender) {
            this.getTemplate(function(data) {
                self.template = data;
                
                setTimeout(function() { //等待init的完成
                    if (self.exist) {
                        var res=self.render();
                        if(res!==false&&!self.__isStartMountSubs){
                            self.trigger('rendered');
                        }
                        self.__rendered=true;
                        self.trigger("renderComplete",true);
                    }
                }, 0);
            });
        }
    },
    _queryModelChange: function(model) {
        
        try{
            if(this.hashHasChanged()){
                var res = this.queryModelChange(model);
            }
        }catch(e){
            
        }
        if(this.__isStartMountSubs)res=false;//如果已经开始渲染子view则不再引发queryModelChange
        this._changeChain(res, model);
    },
    _changeChain: function(res, model) {
        var vcs = [],
            i, vom = this.getVOMObject();
        var vc = vom.getElementById(this.vcid);
        if (res === false) {
            return;
        }
        if (res === true || res === undefined) {
            vcs = vc.childNodes;
        } else if (Base.isArray(res)) {
            vcs = res;
        }
        for (i = 0; i < vcs.length; i++) {
            if (vcs[i].view) {
                vcs[i].view._queryModelChange(model);
            }
        }
    },
    destory: function() {
        
        this.destroy();
    },
    destroy: function() {
        // var vcQueue, i;//, vom = this.getVOMObject();
        
        //vcQueue = this.getDestoryQueue();
        //
/*for( i = vcQueue.length - 1; i > 0; i--) {
            vcQueue[i].removeNode();
        }*/
        
        //var root = vom.getElementById(this.vcid);
        //root.unmountView();
        if (this.events) {
            var node = document.getElementById(this.vcid);
            for (var eventType in this.events) {
                node["on" + eventType] = null;
            }
            node = null;
        }
        
        this.dispose();
    },
/*getDestoryQueue : function() {
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
    },*/
    setData: function(data) {
        this.data = data;
        for (var k in data) {
            if (data[k]&&data[k].toJSON) {
                data[k] = data[k].toJSON();
            }
        }
        data.query = this.queryModel.toJSON();
        this.setRenderer();
    },
    setRenderer: function() {
        
        var self = this,
            rr = this.renderer,
            mcName, wrapperName;
        if (rr) {
            for (mcName in rr) {
                for (wrapperName in rr[mcName]) {
                    (function() {
                        var mn = mcName,
                            wn = wrapperName;
                        var fn = rr[mn][wn];
                        self.data[mn + "_" + wn] = function() {
                            return fn.call(this, self, mn);
                        };
                    })();
                }
            }
        }
    },
    getEventInfo: function(event, node) {
        var target = event.target || event.srcElement,
            type = event.type;
        var mxType = 'mx' + type,
            evtLevel = this.eventsLevel;
        // check if target is a textnode (safari)
        while (target.nodeType === 3) {
            target = target.parentNode;
        }
        var eventInfo = target.getAttribute(mxType);

        // 根据evtLevel,回溯target
        if (evtLevel) var typeLv = evtLevel[type];
        if (!eventInfo && typeLv) {
            // 如果evtLevel是数字,逐级向上回溯
            if (!isNaN(typeLv) && typeLv) {
                while (typeLv && target != node) {
                    target = target.parentNode;
                    eventInfo = target.getAttribute(mxType);
                    if (eventInfo) break;
                    typeLv--;
                }
            } else if (typeLv.split('.')[1]) {
                // 如果是className,直接向上寻找有这个className的父级
                typeLv = typeLv.split('.')[1];
                while (target != node) {
                    target = target.parentNode;
                    if (target.className.indexOf(typeLv) >= 0) {
                        eventInfo = target.getAttribute(mxType);
                        break;
                    }
                }
            } else if (typeLv.split('#')[1]) {
                // 如果是id,直接向上寻找有这个id的父级
                typeLv = typeLv.split('#')[1];
                while (target != node) {
                    target = target.parentNode;
                    if (target.id == typeLv) {
                        eventInfo = target.getAttribute(mxType);
                        break;
                    }
                }
            }
        } else if (!eventInfo) {
            // 如果没有设置eventsLevel且没有找到eventinfo, 默认向上寻找一级
            target = target.parentNode;
            eventInfo = target.getAttribute(mxType);
        }
        return {
            info: eventInfo,
            target: target
        };
    },
    processEvent: function(originEvent, parentNode) {
        var event = originEvent || window.event,
            eventInfo = this.getEventInfo(event, parentNode||document.getElementById(this.vcid)),
            type = event.type,
            eventArgs = {},
            target = eventInfo.target,
            info = eventInfo.info,
            eventArgs = {
                target: target,
                originEvent: event
            };
        if (info) {
            var events = info.split("|"),
                eventArr, eventKey;
            for (var i = 0; i < events.length; i++) {
                eventArr = events[i].split(":");
                eventKey = eventArr.shift();

                // 事件代理,通过最后一个参数,决定是否阻止事件冒泡和取消默认动作
                var evtBehavior = eventArr[eventArr.length - 1],
                    evtArg = false;
                if (evtBehavior == '_halt_' || evtBehavior == '_preventDefault_') {
                    event.preventDefault ? event.preventDefault() : (event.returnValue = false);
                    eventArgs.isPreventDefault = true;
                    evtArg = true;
                }
                if (evtBehavior == '_halt_' || evtBehavior == '_stop_') {
                    event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
                    eventArgs.isStopPropagation = true;
                    evtArg = true;
                }
                if (evtArg) {
                    eventArr.pop();
                }
                this.trigger('beforeEventCall', eventArgs);
                if (this.events && this.events[type] && this.events[type][eventKey]) {
                    this.events[type][eventKey](this, this.idIt(target), eventArr, event);
                }
            }
        }
        this.trigger('delegateEventsFire', eventArgs);
    },
    /**
     * 所有事件处理函数
     * TODO:细化方法使用
     * @property events
     */
    delegateEvents: function() {
        var me = this,
            node = document.getElementById(me.vcid),
            events = this.events;
        for (var type in events) {
            node["on" + type] = function(e) {
                me.processEvent(e, node);
            };
        }
    },
    setViewHTML:function(html){
        var me=this;
        if(me.exist){
            me.trigger("beforeRebuild",true);
            me.trigger("prerender");
            document.getElementById(me.vcid).innerHTML=html;
            me.trigger("rendered");
            me.__isStartMountSubs=true;
            setTimeout(function(){delete me.__isStartMountSubs},0);
            return true;
        }
        return false;
    },
    render: function() {
       /* if (this.preventRender) {
            this.rendered = true;
            return true;
        }
        
        var node = document.getElementById(this.vcid),
            templet = this.getTemplateObject();
        
        this.setData({}); //确保renderer正确工作，否则在未重写render方法，而又未调用setData时renderer无法正确工作
        node.innerHTML = templet.toHTML({
            template: this.template,
            data: this.data
        });
        this.rendered = true;*/
    },
    getTemplate: function(cb, name) {
        if (this.template) {
            cb(this.template);
            return;
        }
        //var router=this.getRouterObject();
        
        var url = Magix.config.appHome;
        if (/\/app\/$/.test(url)) url += this.viewName.split("app")[1];
        else url += this.viewName;
        if (name) {
            url = url + "." + "name" + ".html";
        } else {
            url = url + ".html";
        }
        url = url.replace(/([^:\/])\/+/g, '$1\/'); //修正多个/紧挨的问题
        //url = url.replace(/\.html([\W])?/,Magix.config.release?'_c.html$1':'.source.html$1');
        var ajax = this.getAjaxObject();
        
        if (Magix.dev || !Magix.config.release) url += '?t=' + new Date().getTime();
        ajax.getTemplate(url, function(data) {
            
            cb(data);
        }, function(msg) {
            
            cb(msg);
        }, this.viewName);
    },
    idIt: function(node) {
        var id = "";
        if (!node.id) {
            node.id = Base.uniqueId("mxevt-");
        }
        id = node.id;
        node = null;
        return id;
    },
    receiveMessage:function(e){

    },
    hashChange:function(e){

    },
    _hashChange:function(qm){
        var me=this;
        if(!me.__isStartMountSubs){
            if(me.hashHasChanged()){
                me.hashChange(qm);
                me.observeHash();
            }
        }
    },
    _receiveMessage:function(e){
        var me=this;
        try{
            if(me.exist&&me.__rendered){
                me.receiveMessage(e);
            }else{
                me.unbind("renderComplete");
                me.bind('renderComplete',function(){
                    me.receiveMessage(e);
                });
            }
        }catch(e){
            
        }
    },
    postMessageTo:function(key,data){
        var vom=this.getVOMObject();
        if(!Base.isArray(key))key=[key];
        for(var i=0;i<key.length;i++){
            var vframe=vom.get(key[i]);
            if(vframe)vframe.postMessage(data,this);
        }        
    },
    observeHash:function(keys,_ignore){
        var me=this;
        if(keys){
            if(Base.isString(keys)){
                keys=keys.split(',');
            }else if(!Base.isArray(keys)){
                keys=[keys];
            }
            me.$observeHashKeys=keys;//保存当前监控的hash key
            me.$observeHashCache={};//缓存当前hash的值
            for(var i=0;i<keys.length;i++){
                me.$observeHashCache[keys[i]]=me.queryModel.get(keys[i]);
            }
        }else if(!_ignore){//如果未传递key 则使用上次设置的key重新缓存
            me.observeHash(me.$observeHashKeys,true);
        }
    },
    hashHasChanged:function(keys){
        var me=this,
            hashCache=me.$observeHashCache,
            realCache=me.$realUsingCache,
            result;
        if(!keys)keys=me.$observeHashKeys;//如果未传递keys，则使用当初监控时的keys
        if(keys){
            if(Base.isString(keys)){
                keys=keys.split(',');
            }else if(!Base.isArray(keys)){
                keys=[keys];
            }
            if(hashCache){//表示调用过observeHash 
                result=false;
                
                for(var i=0,k,v;i<keys.length;i++){
                    k=keys[i];
                    if(!hashCache.hasOwnProperty(k)){
                        
                    }else{
                        v=me.queryModel.get(k);
                        result=hashCache[k]!=v;
                        if(result&&realCache&&realCache.hasOwnProperty(k)){//值有改变，看是否和真实使用中的相同
                            result=realCache[k]!=v;//
                        }
                        if(result){
                            break;
                        }
                    }
                }
                return result;
            }else{//未调用 走queryModel的hasChanged方法
                for(var i=0;i<keys.length;i++){
                    if(me.queryModel.hasChanged(keys[i])){
                        return true;
                    }
                }
                return false;
            }
        }
        return true;
    },
    hashHasChangedExcept:function(keys){
        var tempKeys=[],
            tempObj={},
            me=this,
            obsKeys=me.$observeHashKeys;
        if(keys&&obsKeys){
            if(Base.isString(keys)){
                keys=keys.split(',');
            }else if(!Base.isArray(keys)){
                keys=[keys];
            }
            for(var i=0;i<keys.length;i++){
                tempObj[keys[i]]=1;
            }
            for(var i=0;i<obsKeys.length;i++){
                if(!tempObj[obsKeys[i]]){
                    tempKeys.push(obsKeys[i]);
                }
            }
        }else{
            tempKeys=obsKeys;
        }
        return me.hashHasChanged(tempKeys);
    },
    hashRealUsing:function(obj){
        var me=this;
        if(obj){//设置hash对应的真实使用的值
            if(!me.$realUsingCache)me.$realUsingCache={};
            for(var p in obj){
                me.$realUsingCache[p]=obj[p];
            }
        }
    }
});

	return Base.implement(View,impl);
},{
	requires:["magix/impls/view","magix/base"]
});//vom
KISSY.add("magix/vom",function(S,impl,Base){
	var VOM = {};
	Base.mix(VOM, {
	_idMap : {},
	root : null,
	setRootVframe : Base.unimpl,
	getVframeClass:Base.unimpl,
	init : function () {
		var me = this;
		if (!me.inited) { //确保只执行一次
			me.setRootVframe();
			me.inited = true;
		}
		return me;
	},
	push : function (vc) {
		this._idMap[vc.id] = vc;
	},
	pop : function (vc) {
		delete this._idMap[vc.id];
	},
	createElement : function (ele, id) {
		if (Base.isString(ele)) {
			ele = document.getElementById(ele);
		}
		var Vframe=this.getVframeClass(),
			vc=new Vframe(ele,id);
		vc.__VOM=this;
		vc.__Router=this.__Router;
		this.push(vc);
		return vc;
	},
	getElementById : function (id) {
		return this._idMap[id] || null;
	},
	get:function(id){
		return this.getElementById(id);
	},
	broadcaseMessage:function(data,from){
		var me=this,c=me._idMap;
		for(var p in c){
			c[p].postMessage(data,from||this);
		}
	},
	notifyQueryModelChange:function(qm){
		var me=this;
		if(me.root&&me.root.view){
			me.root.view._queryModelChange(qm);
		}
		for(var p in me._idMap){
			try{
				var view=me._idMap[p].view;
				if(view&&view.exist){
					view._hashChange(qm);
				}
			}catch(e){
				
			}
		}
	},
	mountRootView:function(viewName,queryModel){
		var me=this;
		if(me.root){
			me.root.mountView(viewName,{
				queryModel:queryModel
			});
		}
	}
});

	Base.mix(VOM, impl);
	return VOM.init();
},{
	requires:["magix/impls/vom","magix/base"]
});
