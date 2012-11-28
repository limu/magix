/**
 * @fileOverview 多播事件对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add("magix/event",function(S,Magix){
	/**
 * 根据名称生成事件数组的key
 * @param  {Strig} name 事件名称
 * @return {String} 包装后的key
 */
var genKey=function(name){
	return '~~'+name+'_list';
};

var safeExec=Magix.safeExec;
/**
 * 多播事件对象
 * @name Event
 * @namespace
 */
var Event={
	/**
	 * @lends Event
	 */
	/**
	 * 触发事件
	 * @param {String} name 事件名称
	 * @param {Object} data 事件对象
	 * @param {Boolean} remove 事件触发完成后是否移除这个事件的所有监听
	 * @param {Boolean} lastToFirst 是否从后向前触发事件的监听列表
	 */
	trigger:function(name,data,remove,lastToFirst){
		var key=genKey(name),
			me=this,
			list=me[key];
		if(list){
			if(!data)data={};
			if(!data.type)data.type=name;
			if(lastToFirst){
				for(var i=list.length-1;i>=0;i--){
					if(safeExec(list[i],data,me)===false){
						break;
					}
				}
			}else{
				for(var i=0,j=list.length;i<j;i++){
					if(safeExec(list[i],data,me)===false){
						break;
					}
				}
			}
		}
		if(remove){
			delete me[key];
		}
	},
	/**
	 * 绑定事件
	 * @param  {String}   name 事件名称
	 * @param  {Function} fn   事件回调
	 */
	bind:function(name,fn){
		var key=genKey(name);
		if(!this[key])this[key]=[];
		this[key].push(fn);
	},
	/**
	 * 解除事件绑定
	 * @param  {String}   name 事件名称
	 * @param  {Function} fn   事件回调
	 */
	unbind:function(name,fn){
		var key=genKey(name),
			list=this[key];
		if(list){
			if(fn){
				for(var i=0,j=list.length;i<j;i++){
					if(list[i]==fn){
						list.splice(i,1);
						break;
					}
				}
			}else{
				delete this[key];
			}
		}
	}
};
	return Event;
},{
	requires:["magix/magix"]
});/**
 * @fileOverview magix中根据底层类库需要重写的方法
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/impl/magix',function(S){
	return {
		include:function(path){
			var url = S.Config.packages.magix.path+path + ".js?r=" + Math.random();
			var xhr = window.ActiveXObject || window.XMLHttpRequest;
			var r = new xhr('Microsoft.XMLHTTP');
			r.open('GET', url, false);
			r.send(null);
			return r.responseText;
		},
		libRequire:function(name,fn){
			S.use(name,function(S,T){
				fn(T)
			});
		},
		libEnv:function(){
			var me=this;
			var cfg=me.config();
			var appHome=cfg.appHome;
			if(!appHome){
				throw new Error('please set appHome');
			}
			appHome=appHome.replace(/(^|\/)app\/?/i,function(a,b){
				return b||'./';
			});
			cfg.appHome=appHome;
			
			if(!cfg.release&&/^https?:\/\//.test(appHome)){
				cfg.release= appHome.indexOf(location.protocol+'//'+location.host)==-1;
			}
			if(!cfg.release){
				var reg=new RegExp("("+appHome+".+)-min\\.js(\\?[^?]+)?");
				S.config({
					map:[[reg,'$1.js$2']]
				});
			}
			S.config({
				packages:[{
					name:'app',
					path:appHome,
					tag:cfg.release?'':S.now()
				}]
			});
			if(cfg.viewChangeAnim){
				S.use('mxext/vfanim');
			}
		},
		isArray:S.isArray,
		isFunction:S.isFunction,
		isObject:S.isObject,
		isRegExp:S.isRegExp,
		isString:S.isString,
		isNumber:S.isNumber
	}
});/**
 * @fileOverview router中根据底层类库需要重写的方法
 * @author 行列
 * @version 1.0
 */
KISSY.add("magix/impl/router",function(S){
	return {
		useHistoryState:function(){
			var me=this,initialURL=location.href;
			S.one(window).on('popstate',function(e){
				var equal=location.href==initialURL;
				if(!me.$canFirePopState&&equal)return;
				me.$canFirePopState=true;
				
				me.route();
			});
		},
		useLocationHash:function(){
			var me=this;
			S.one(window).on('hashchange',function(e){
				me.suspend();
				
				me.route();
				me.resume();
			});
		}
	}
});/**
 * @fileOverview view中根据底层类库需要重写的方法
 * @author 行列
 * @version 1.0
 */
KISSY.add("magix/impl/view",function(S,io,Sizzle,Magix){
	var IView=function(){

	};
	var StaticWhiteList={
		idIt:1,
		wrapAsyncUpdate:1,
		registerAsyncUpdateName:1,
		extend:1
	};
	var ex=function(props,ctor){
		var me=this;
		var fn=function(){
			fn.superclass.constructor.apply(this,arguments);
			if(ctor){
				Magix.safeExec(ctor,[],this);
			}
		}
		for(var p in me){
			if(Magix.hasProp(StaticWhiteList,p)){
				fn[p]=me[p];
			}
		}
		return S.extend(fn,me,props);
	};

	IView.extend=ex;

	Magix.mix(IView.prototype,{
		getTmplByXHR:function(path,fn){
			io({
				url:path,
				dataType:'html',
				success:function(tmpl){
					fn(tmpl);
				},
				error:function(e,msg){
					fn(msg);
				}
			});
		},
		delegateUnbubble:function(node,event){
			var me=this;
			if(!me.$cacheEvents)me.$cacheEvents={};
			node=S.one(node);
			node.delegate(event,'*[mx'+event+']',me.$cacheEvents[event]=function(e){
				me.processEvent(e);
			});
		},
		undelegateUnbubble:function(node,event){
			var me=this;
			var cache=me.$cacheEvents;
			if(cache){
				node=S.one(node);
				//
				node.undelegate(event,'*[mx'+event+']',cache[event]);
				delete cache[event];
			}
		}
	});

	return IView;
},{
	requires:["ajax","sizzle","magix/magix"]
});/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add('magix/magix',function(S,IMagix){
	
/**
 * 检测某个对象是否拥有某个属性
 * @param  {Object}  owner 检测对象
 * @param  {String}  prop  属性
 * @return {Boolean} 是否拥有prop属性 
 */
var has=function(owner,prop){
	if(!owner)return false;//false 0 null '' undefined
	return Object.prototype.hasOwnProperty.call(owner,prop);
};

/**
 * 混合对象的属性
 * @param  {Object} aim    要mix的目标对象
 * @param  {Object} src    mix的来源对象
 * @param  {Object} ignore 在复制时，忽略的值
 * @return {Object}
 */
var mix=function(aim,src,ignore){
	for(var p in src){
		if(has(src,p)&&(!ignore||!has(ignore,p))){
			aim[p]=src[p];
		}
	}
	return aim;
};

/**
 * 以try cache方式执行方法，忽略掉任何异常
 * @param  {Array} fns     函数数组
 * @param  {Array} args    参数数组
 * @param  {Object} context 在待执行的方法内部，this的指向
 * @return {Object} 返回执行的最后一个方法的返回值
 */
var safeExec=function(fns,args,context,i,r,e){
	if(!Magix.isArray(fns)){
		fns=[fns];
	}
	if(!args||(!Magix.isArray(args)&&!args.callee)){
		args=[args];
	}
	for(i=0;i<fns.length;i++){
		try{
			e=fns[i];
			r=Magix.isFunction(e)&&e.apply(context,args);
		}catch(x){
			
		}
	}
	return r;
};
/**
待重写的方法
@method imimpl
**/
var unimpl = function() {
	throw new Error("unimplement method");
};
/**
 * 空方法
 */
var noop=function(){};


/**
 * Magix全局对象
 * @name Magix
 * @namespace
 */
var Magix={
	/**
	 * @lends Magix
	 */
	/**
	 * 判断o是否为数组
	 * @function
	 * @param {Object} o 待检测的对象
	 * @return {Boolean}
	 */
	isArray:unimpl,
	/**
	 * 判断o是否为对象
	 * @function
	 * @param {Object} o 待检测的对象
	 * @return {Boolean}
	 */
	isObject:unimpl,
	/**
	 * 判断o是否为函数
	 * @function
	 * @param {Object} o 待检测的对象
	 * @return {Boolean}
	 */
	isFunction:unimpl,
	/**
	 * 判断o是否为正则
	 * @function
	 * @param {Object} o 待检测的对象
	 * @return {Boolean}
	 */
	isRegExp:unimpl,
	/**
	 * 判断o是否为字符串
	 * @function
	 * @param {Object} o 待检测的对象
	 * @return {Boolean}
	 */
	isString:unimpl,
	/**
	 * 判断o是否为数字
	 * @function
	 * @param {Object} o 待检测的对象
	 * @return {Boolean}
	 */
	isNumber:unimpl,
	/**
	 * 利用底层类库的包机制加载js文件，仅Magix内部使用，不推荐在app中使用
	 * @function
	 * @param {String} name 形如app/views/home这样的字符串
	 * @param {Function} fn 加载完成后的回调方法
	 */
	libRequire:unimpl,
	/**
	 * 通过xhr同步获取文件的内容，仅开发magix时使用
	 * @function
	 * @param {String} path 文件路径
	 * @return {String} 文件内容
	 */
	include:unimpl,
	/**
	 * 设置底层类库的环境
	 * @function
	 */
	libEnv:unimpl,
	/**
	 * 把src对象的值混入到aim对象上
	 * @function
	 * @param  {Object} aim    要mix的目标对象
	 * @param  {Object} src    mix的来源对象
	 * @param  {Object} [ignore] 在复制时，需要忽略的key
	 * @return {Object}
	 */
	mix:mix,
	/**
	 * 未实现的方法
	 * @function
	 * @type {Function}
	 */
	unimpl:unimpl,
	/**
	 * 检测某个对象是否拥有某个属性
	 * @function
	 * @param  {Object}  owner 检测对象
	 * @param  {String}  prop  属性
	 * @return {Boolean} 是否拥有prop属性 
	 */
	hasProp:has,
	/**
	 * 以try catch的方式执行方法，忽略掉任何异常
	 * @function
	 * @param  {Array} fns     函数数组
	 * @param  {Array} args    参数数组
	 * @param  {Object} context 在待执行的方法内部，this的指向
	 * @return {Object} 返回执行的最后一个方法的返回值
	 * @example
	 * var f1=function(){
	 * 		throw new Error('msg');
	 * };
	 *
	 * var f2=function(msg){
	 * 		return 'new_'+msg;
	 * };
	 *
	 * var result=Magix.safeExec([f1,f2],new Date().getTime());
	 *
	 * S.log(result);//得到f2的返回值
	 */
	safeExec:safeExec,
	/**
	 * 空方法
	 * @function
	 */
	noop:noop,
	/**
	 * 供打包上线用的模板缓存对象
	 * @type {Object}
	 * @property {Object} templates
	 */
	templates:{},
	/**
	 * 配置信息对象
	 */
	cfg:{},
	/**
	全局缓存对象
	**/
	locals:{},
	/**
	 * 设置或获取配置信息
	 * @param {Object} [cfg] 配置信息对象
	 * @return {Object} 配置信息对象
	 * @example
	 * Magix.config({
	 * 		useHistoryState:true,
	 * 		appHome:'./test/app'
	 * });
	 *
	 * var config=Magix.config();
	 *
	 * S.log(config.appHome);
	 */
	config:function(cfg){
		var me=this;
		var oldCfg=me.cfg;
		if(cfg){
			me.cfg=mix(oldCfg,cfg);
		}
		return me.cfg;
	},
	/**
	 * magix开始工作
	 * @param  {Object} cfg 初始化配置参数对象
	 * @param {String} cfg.appHome 当前app所在的文件夹路径 http 形式的 如：http://etao.com/srp/app/
	 * @param {Boolean} cfg.release 指定当前app是否是发布版本，当使用发布版本时，view的html和js应该打包成一个 view-min.js文件，否则Magix在加载view时会分开加载view.js和view.html(view.hasTemplate为true的情况下)
	 * @param {Boolean} cfg.useHistoryState 是否使用history state,当为true，并且浏览器支持的情况下会用history.pushState修改url，您应该确保服务器能给予支持。如果useHistoryState为false将使用hash修改url
	 * @param {Object} cfg.pathCfg 前端view与地址栏中的pathname对应关系
	 * @example
	 * Magix.start({
	 * 		useHistoryState:true,
	 * 		appHome:'http://etao.com/srp/app/',
	 * 		release:false,
	 * 		pathCfg:{
	 * 			index:'app/views/layouts/default',//默认首页
	 * 			map:{
	 * 				'app/views/layouts/default':['/list','/home',/^\/list\/\d+/i],//前端的app/views/layouts/default可对应哪些pathname,可以是正则
	 * 				'app/views/layouts/modules':['/module']
	 * 			}
	 * 		}
	 * });
	 * // 为什么在map中是真实的映射到虚拟的？
	 * // 原来是虚拟的映射真实的，如：
	 * // {
	 * //    '/home':'app/views/layouts/default',
	 * //    '/modules':'app/views/layouts/default'
	 * // }
	 * // 虚拟的个数>=真实的个数
	 * // 所以如果是虚拟的对应真实的，映射列表将非常长
	 * // 而且无法用正则来表示虚拟的pathname
	 */
	start:function(cfg){
		var me=this;
		cfg=me.config(cfg);
		me.libEnv();
		if(cfg.ready){
			safeExec(cfg.ready);
			delete cfg.ready;
		}
		me.libRequire('magix/router',function(R){
			me.libRequire('magix/vom',function(V){
				R.bind('locationChanged',function(e){
					if(e.changed.isViewPath()){
						V.remountRootVframe(e);
					}else{
						V.notifyLocationChange(e);
					}
				});
				R.bind('idle',function(){
					V.resume();
				});
				R.bind('busy',function(){
					V.suspend();
				});
				R.start();
			});	
		});
	},
	/**
	 * 获取对象的keys
	 * @param  {Object} obj 要获取key的对象
	 * @return {Array}
	 */
	objectKeys:function(obj){
		if(Object.keys){
			return Object.keys(obj);
		}else{
			var keys=[];
			for(var p in obj){
				if(has(obj,p)){
					keys.push(p);
				}
			}
			return keys;
		}
	},
	/**
	 * 获取或设置Magix.locals，您可以把整个app需要共享的数据，通过该方法进行全局存储，方便您在任意view中访问这份数据
	 * @param {String|Object} key 获取或设置Magix.locals时的key 或者 设置Magix.locals的对象
	 * @param {[type]} [val] 设置的对象
	 * @return {Object|Undefined}
	 * @example
	 * Magix.local({//以对象的形式存值
	 * 		userId:'58782'
	 * });
	 *
	 * Magix.local('userName','xinglie.lkf');
	 *
	 * var userId=Magix.local('userId');//获取userId
	 *
	 * var locals=Magix.local();//获取所有的值
	 *
	 * S.log(locals);
	 */
	local:function(key,val){
		var args=arguments;
		var me=this;
		var locals=me.locals;
		if(args.length==0){
			return locals;
		}else if(args.length==1){
			if(me.isObject(key)){
				for(var p in key){
					if(has(key,p)){
						locals[p]=key[p];
					}
				}
			}else{
				return locals[key];
			}
		}else{
			locals[key]=val;
		}
	}
};

	return Magix.mix(Magix,IMagix);
},{
	requires:["magix/impl/magix"]
});/**
 * @fileOverview 路由
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/router',function(S,IRouter,Magix,Event){
	
var HAS=Magix.hasProp;

var isParam=function(key){
	return HAS(this.params,key);
};
var isPathname=function(){
	return HAS(this,PATHNAME);	
};
var isViewPath=function(){
	return HAS(this,'viewPath');
};
/*var isParamChangedExcept=function(args){
	if(Magix.isString(args)){
		args=args.split(',');
	}else if(!Magix.isArray(args)){
		args=[args];
	}
	var temp={};
	for(var i=0;i<args.length;i++){
		temp[args[i]]=true;
	}
	var keys=Magix.objectKeys(this.params);
	for(i=0;i<keys.length;i++){
		if(!HAS(temp,keys[i])){
			return true;
		}
	}
	return false;
};*/
var isPathnameDiff=function(){
	var me=this;
	var hash=me.hash;
	var query=me.query;
	return hash[PATHNAME]!=query[PATHNAME];
};
var isParamDiff=function(param){
	var me=this;
	var hash=me.hash;
	var query=me.query;
	return hash.params[param]!=query.params[param];
};
var hashParamsOwn=function(key){
	var me=this;
	var hash=me.hash;
	return HAS(hash.params,key);
};
var queryParamsOwn=function(key){
	var me=this;
	var query=me.query;
	return HAS(query.params,key);
};

var getParam=function(key){
	var me=this;
	var params=me.params;
	return params[key];
};

var safeExec=Magix.safeExec;

var WIN=window;
var ENCODE=encodeURIComponent;
var DECODE=decodeURIComponent;

var PathRelativeReg=/\/[^\/]+?\/\.{2}\/|([^:\/])\/\/+/;
var PathTrimFileReg=/[^\/]*$/;
var PathTrimParamsReg=/([#?]).*$/;
var ParamsReg=/([^=&?\/#]+)=([^&=#?]*)/g;
var EMPTY='';
var PATHNAME='pathname';
//var PathTrimFileParamsReg=/(\/)?[^\/]*[=#]$/;//).replace(,'$1').replace(,EMPTY);
//var PathTrimSearch=/\?.*$/;
/**
 * @name Router
 * @namespace
 * @borrows Event.bind as bind
 * @borrows Event.trigger as trigger
 * @borrows Event.unbind as unbind
 */
var Router=Magix.mix({
	/**
	 * @lends Router
	 */
	iQ:[],
	iC:0,
	/**
	 * 使用history state做为改变url的方式来保存当前页面的状态
	 * @function
	 */
	useHistoryState:Magix.unimpl,
	/**
	 * 使用hash做为改变url的方式来保存当前页面的状态
	 * @function
	 */
	useLocationHash:Magix.unimpl,
	/**
	 * 比较2个参数对象值是否一样，浅比较
	 * @param  {Object} p1 给定的第一个对象
	 * @param  {Object} p2 给定的第二个对象
	 * @return {Boolean} 2个对象的内容是否一样
	 */
	compareObject:function(p1,p2){
		var me=Magix;
		if(me.isObject(p1)&&me.isObject(p2)){
			var keys=[];
			keys=keys.concat(me.objectKeys(p1));
			keys=keys.concat(me.objectKeys(p2));
			for(var i=0;i<keys.length;i++){
				var key=keys[i];
				if(p1[key]!=p2[key]){
					return false;
				}
			}
			return true;
		}else{
			return p1==p2;
		}
	},
	/**
	 * 获取pathname前端真实路径跟虚拟路径之间的映射关系
	 * @return {Object}
	 */
	getPathnameRelations:function(){//获取pathname关系，真实与虚拟之间的映射
		var me=this;
		if(me.$pnr)return me.$pnr;
		var temp={
			//realPathname:{},//真实存在的pathname表
			virtualToReal:{},//虚拟到真实的映射关系表
			virtualRegExpToReal:{}//带正则的虚拟到真实映射关系表
		};
		var mxConfig=Magix.config();
		var pathCfg=mxConfig.pathCfg;
		//var pathnameHome=pathCfg.path||EMPTY;
		var map=pathCfg.map;
		var home=pathCfg.defaultView;//处理默认加载的viewPath
		var dPathname=pathCfg.defaultPathname;

		
		if(Magix.isObject(map)){//我们无法获知当前项目硬盘上存在多少个layouts（不借助其它工具）,但我们可以通过对代码的分析得到，因为有用到的都应该配置出来，所以我们对虚拟配置进行分析
			for(var p in map){
				if(HAS(map,p)){
					var pn=/*pathnameHome+*/p;
					if(pn.charAt(pn.length-1)=='/'){//保持与kissy的一致处理
						pn+='index';
					}
					//temp.realPathname[pn]=true;
					var pv=map[p];
					var pvs=[];
					if(Magix.isArray(pv)){
						pvs=pv;
					}else if(Magix.isString(pv)){
						pvs=pv.split(',');
					}else{
						pvs=[pv];
					}
					for(var i=0;i<pvs.length;i++){
						if(Magix.isRegExp(pvs[i])){//我们来解决url重写后需要使用正则处理的问题
							temp.virtualRegExpToReal[pn]=pvs[i]
						}else{
							if(!dPathname&&pn==home){
								dPathname=pvs[i];
							}
							temp.virtualToReal[pvs[i]]=pn;
						}
					}
				}
			}
			if(home){
				//home=pathnameHome+home;
				if(home.charAt(home.length-1)=='/'){
					home+='index';
				}
				//temp.realPathname[home]=true;
				//temp.virtualToReal[EMPTY]=home;
			}
		}
		
		if(!home||!dPathname){
			throw new Error('unset defaultPathname or defaultView attribute for pathCfg');
		}
		temp.home=home;//||temp.virtualToReal[EMPTY];
		temp[PATHNAME]=dPathname;

		//关于notFound
		//当用户配置了notFound则认为找不到相应的前端view时显示notFound的view
		//如果没有配置，则在找不到相应的view时，显示默认的首页view
		temp.hasNotFound=HAS(pathCfg,'notFound');
		temp.notFound=pathCfg.notFound;
		
		return me.$pnr=temp;
	},
	/**
	 * 根据地址栏中的pathname获取对应的前端viewPath
	 * @param  {String} pathname 形如/list/index这样的pathname
	 * @return {String} 返回形如app/views/layouts/index这样的字符串
	 */
	getViewPath:function(pathname){//虚拟转换真实的pathname
		var me=this;
		var pnr=me.getPathnameRelations();

		if(!pathname)pathname=pnr[PATHNAME];

		var result=pnr.virtualToReal[pathname];//简单的在映射表中找
		if(!result){//未找到，在正则表达式中查找
			for(var p in pnr.virtualRegExpToReal){
				if(pnr.virtualRegExpToReal[p].test(pathname)){
					result=p;
					break;
				}
			}
		}

		return {
			viewPath:result?result:(pnr.hasNotFound?pnr.notFound:pnr.home),
			pathname:result?pathname:(pnr.hasNotFound?pathname:pnr[PATHNAME])
		}
	},
	/**
	 * 开始路由工作
	 */
	start:function(){
		var me=this;
		if(me.supportHistoryState()){
			me.useHistoryState();
		}else{
			me.useLocationHash();
		}
		me.route();//页面首次加载，初始化整个页面
	},
	/**
	 * 检测当前环境是否允许使用history state
	 */
	supportHistoryState:function(){
		var H=WIN.history;
		var cfg=Magix.config();
		return cfg.useHistoryState&&H.pushState&&H.replaceState;
	},
	/**
	 * 把路径字符串转换成对象
	 * @param  {String} path 路径字符串
	 * @return {Object} 解析后的对象
	 */
	pathToObject:function(path){
		//把形如 /xxx/a=b&c=d 转换成对象 {pathname:'/xxx/',params:{a:'b',c:'d'}}
		//1. /xxx/a.b.c.html?a=b&c=d  pathname /xxx/a.b.c.html 
		//2. /xxx/?a=b&c=d  pathname /xxx/
		//3. /xxx/#?a=b => pathname /xxx/
		//4. /xxx/index.html# => pathname /xxx/index.html
		//5. /xxx/index.html  => pathname /xxx/index.html
		//6. /xxx/#           => pathname /xxx/
		//7. a=b&c=d          => pathname ''
		//8. /s?src=b#        => pathname /s params:{src:'b'}
		var me=this;
		var obj={};
		var params={};
		var protocol=WIN.location.protocol;
		var pathname=EMPTY;
		if(PathTrimParamsReg.test(path)){//有#?号，表示有pathname
			pathname=path.replace(PathTrimParamsReg,EMPTY)
		}else if(!~path.indexOf('=')){//没有=号，路径可能是 xxx 相对路径 
			pathname=path;
		}
		
		if(pathname){
			if(pathname.indexOf(protocol)==0){//解析以https?:开头的网址
				var first=pathname.indexOf('/',protocol.length+2);//找最近的 / 
				if(first==-1){//未找到，比如 http://etao.com
					pathname='/';//则pathname为  /
				}else{
					pathname=pathname.substring(first); //截取
				}
			}else if(pathname.charAt(0)!='/'&&Magix.config().useHistoryState&&!me.supportHistoryState()){//如果不是以/开头的并且要使用history state,当前浏览器又不支持history state则放hash中的pathname要进行处理
				var pn=WIN.location[PATHNAME].replace(PathTrimFileReg,EMPTY);
				pn=pn+pathname;//地址栏中的pathname加上相对的
				while(PathRelativeReg.test(pn)){
					pn=pn.replace(PathRelativeReg,'$1/');
				}
				pathname=pn;
			}
		}
		path.replace(ParamsReg,function(match,name,value){
			params[name]=value;
		});
		obj[PATHNAME]=pathname;
		obj.params=params;
		return obj;
	},
	/**
	 * 把对象内容转换成字符串路径
	 * @param  {Object} obj 对象
	 * @return {String} 字符串路径
	 */
	objectToPath:function(obj){//上个方法的逆向
		var pn=obj[PATHNAME];
		var params=[];
		for(var p in obj.params){
			if(HAS(obj.params,p)){
				//if(obj.params[p]){//我们在此过滤掉了空字符串这样的参数
					params.push(p+'='+obj.params[p]);
				//}
			}
		}
		return pn+(params.length?'?':EMPTY)+params.join('&');
	},
	/**
	 * 解析query和hash
	 * @return {Object} 解析的对象
	 */
	parseQueryAndHash:function(){
		var me=this;
		var href=DECODE(WIN.location.href);
		var cache=me.$QH;
		if(cache&&cache.p==href){
			return cache.o;
		}
		var params=href.replace(/^[^?#]+/g,EMPTY);
		var query=WIN.location[PATHNAME]+params.replace(/^([^#]+).*$/g,'$1');
		var hash=params.replace(/^[^#]*#?/g,EMPTY);//原始hash

		var queryObj=me.pathToObject(query);
		//
		var hashObj=me.pathToObject(hash.replace(/^!?/,EMPTY));//去掉可能的！开始符号
		//
		var comObj={};//把query和hash解析的参数进行合并，用于hash和pushState之间的过度
		Magix.mix(comObj,queryObj.params);
		Magix.mix(comObj,hashObj.params);
		cache=me.$QH={
			p:href,
			o:{
				isPathnameDiff:isPathnameDiff,
				isParamDiff:isParamDiff,
				hashParamsOwn:hashParamsOwn,
				queryParamsOwn:queryParamsOwn,
				get:getParam,
				originalQuery:query,
				originalHash:hash,
				query:queryObj,
				hash:hashObj,
				params:comObj
			}
		};
		return cache.o;
	},
	/**
	 * 解析window.location.href字符串为对象
	 * @return {Object}
	 */
	parseLocation:function(){
		var me=this;
		var queryHash=me.parseQueryAndHash();

		//

		var tempPathname;
		/*
			1.在选择pathname时，不能简单的把hash中的覆盖query中的。有可能是从不支持history state浏览器上拷贝链接到支持的浏览器上，分情况而定：
			如果hash中存在pathname则使用hash中的，否则用query中的

			2.如果指定不用history state则直接使用hash中的pathname
			
			以下是对第1条带hash的讨论
			// http://etao.com/list/?a=b#!/home?page=2&rows=20
			//  /list/index
			//  /home 
			//   http://etao.com/list?page=3#!/home?page=2;
			// 情形A. pathname不变 http://etao.com/list?page=3#!/list?page=2 到支持history state的浏览器上 参数合并;
			// 情形B .pathname有变化 http://etao.com/list?page=3#!/home?page=2 到支持history state的浏览器上 参数合并,pathname以hash中的为准;
		*/
		var mxConfig=Magix.config();
		if(mxConfig.useHistoryState){//指定使用history state
			/*
			if(me.supportHistoryState()){//当前浏览器也支持
				if(hashObj[PATHNAME]){//优先使用hash中的，理由见上1
					tempPathname=hashObj[PATHNAME];
				}else{
					tempPathname=queryObj[PATHNAME];
				}
			}else{//指定使用history 但浏览器不支持 说明服务器支持这个路径，规则同上
				if(hashObj[PATHNAME]){//优先使用hash中的，理由见上1
					tempPathname=hashObj[PATHNAME];
				}else{
					tempPathname=queryObj[PATHNAME];
				}
			}
			合并后如下：
			*/
			//
			if(queryHash.hash[PATHNAME]){
				tempPathname=queryHash.hash[PATHNAME];
			}else{
				tempPathname=queryHash.query[PATHNAME];
			}
		}else{//指定不用history state ，那咱还能说什么呢，直接用hash
			tempPathname=queryHash.hash[PATHNAME];
		}
		var viewPath=me.getViewPath(tempPathname);
		return Magix.mix(queryHash,viewPath);
		/*return Magix.mix(queryHash,{ //先不加referrer 
			referrer:me.$referrer||EMPTY,
			referrerLocation:me.$location||null
		});*/
	},
	/**
	 * 获取2个location对象之间的差异部分
	 * @param  {Object} oldLocation 原始的location对象
	 * @param  {Object} newLocation 当前的location对象
	 * @return {Object} 返回包含差异信息的对象
	 */
	getChangedLocation:function(oldLocation,newLocation){
		var temp={params:{}};
		if(oldLocation[PATHNAME]!=newLocation[PATHNAME]){
			temp[PATHNAME]=true;
		}
		if(oldLocation.viewPath!=newLocation.viewPath){
			temp.viewPath=true;
		}
		var keys=Magix.objectKeys(oldLocation.params);
		keys=keys.concat(Magix.objectKeys(newLocation.params));
		for(var i=0;i<keys.length;i++){
			var key=keys[i];
			if(oldLocation.params[key]!=newLocation.params[key]){
				temp.params[key]=true;
			}
		}
		temp.isParam=isParam;
		temp.isPathname=isPathname;
		temp.isViewPath=isViewPath;
		//temp.isParamChangedExcept=isParamChangedExcept;
		return temp;
	},
	/**
	 * 根据window.location.href路由并派发相应的事件
	 */
	route:function(){
		var me=this;
		var location=me.parseLocation();
		var oldLocation=me.$location||{params:{}};
		var firstFired=!me.$location;//是否强制触发的locationChange，对于首次加载会强制触发一次
		var oldViewPath=oldLocation.viewPath||EMPTY;
		var needFire;
		if(location.viewPath==oldViewPath){//要加载的根view路径没变化
			if(!me.compareLocation(oldLocation,location)){//比较参数是否有变化
				needFire=true;
			}
		}else{
			needFire=true;
		}
		if(needFire){
			var changed=me.getChangedLocation(oldLocation,location);
			me.trigger('locationChanged',{
				location:location,
				changed:changed,
				firstFired:firstFired
			});
		}
		me.$location=location;
		//me.$referrer=DECODE(WIN.location.href);
		
		me.resume();
	},
	/**
	 * 比较2个location值内容是否一样
	 * @param {Object} oldLocation 原有的location对象
	 * @param {Object} newLocation 现在的location对象
	 * @return {Object} 是否一样
	 */
	compareLocation:function(oldLocation,newLocation){
		if(oldLocation[PATHNAME]!=newLocation[PATHNAME]){
			return false;
		}
		return this.compareObject(oldLocation.params,newLocation.params);
	},
	/**
	 * 导航到当前的路径 
	 * @param  {String} path 路径
	 */
	navigate2:function(path){
		var me=this;
		if(path&&Magix.isString(path)){
			me.idle(function(){
				me.suspend();
				me.trigger('busy');
				//分析出pathname params
				//与当前的比较是否有变化
				//如果没变化什么也不做
				var pathObj=me.pathToObject(path);
				var tempParams=Magix.mix({},me.$location.params);
				tempParams=Magix.mix(tempParams,pathObj.params);

				if(pathObj[PATHNAME]){
					var mxConfig=Magix.config();
					if(mxConfig.useHistoryState&&!me.supportHistoryState()){//指定使用history state但浏览器不支持，需要把query中的存在的参数以空格替换掉
						var query=me.$location.query;
						if(query&&(query=query.params)){
							for(var p in query){
								if(HAS(query,p)&&!HAS(pathObj.params,p)){
									pathObj.params[p]=EMPTY;
								}
							}
						}
					}
				}else{//如果解析出来的不包含pathname则表示只传递的参数
					//
					pathObj.params=tempParams;
					pathObj[PATHNAME]=me.$location[PATHNAME];//使用原始的pathname
				}
				//
				if(!me.compareLocation(pathObj,me.$location)){
					var tempPath=me.objectToPath(pathObj);
					if(me.supportHistoryState()){//如果使用pushState
						/*var hash=me.$location.hash;
						for(var p in pathObj.params){
							if(HAS(hash.params,p)){
								hash.params[p]=pathObj.params[p];
							}
						}
						hash=me.objectToPath(hash);
						if(hash){
							tempPath+='#!'+hash;//要保留原来的hash哦
						}*/
						me.$canFirePopState=true;
						history.pushState(new Date(),document.title,tempPath);//new Date属于yy出来的
						me.route();
					}else{
						location.hash='#!'+tempPath;
					}
				}else{
					me.resume();
				}
			});
		}
	},
	/**
	 * 根据参数进行有选择的导航
	 * @param  {Object|String} params 对象
	 * @param {String} [pathname] 可选的pathname
	 * @example
	 * KISSY.use('magix/router',function(S,R){
	 * 		R.navigate('/list?page=2&rows=20');//改变pathname和相关的参数，地址栏上的其它参数会进行丢弃，不会保留
	 * 		R.navigate('page=2&rows=20');//只修改参数，地址栏上的其它参数会保留
	 * 		R.navigate({//通过对象修改参数，地址栏上的其它参数会保留
	 * 			page:2,
	 * 			rows:20
	 * 		});
	 *
	 * 		R.navigate({
	 * 			page:2,
	 * 			rows:20
	 * 		},'/list');//导航到 /list?page=2&rows=20 
	 * });
	 */
	navigate:function(params,pathname){
		if(Magix.isObject(params)){
			var arr=[];
			for(var p in params){
				arr.push(p+'='+ENCODE(params[p]));
			}
			params=arr.join('&');
			if(pathname){
				params=pathname+'?'+params;
			}
		}
		this.navigate2(params);
	},
	/**
	 * 主要解决：
	location.hash='a';
	location.hash='b';运行这2行代码
	触发2次hashchange事件，但在这2次事件中通过location.hash拿到的值都是b，所以Router引入idle，当处于闲置状态时，才进行下一个操作，否则就等待上次的完成
	 * @param  {Function} fn 闲置时回调的函数
	 */
	idle:function(fn){
		var me=this;
		if(me.iC){
			me.iQ.push(fn);
		}else{
			safeExec(fn);
		}
	},
	/**
	 * 挂起Router，更新地址并不是同步的（hash部分），对于后续依赖window.location.href的，需要挂起等待
	 */
	suspend:function(){
		var me=this;
		me.iC++;
	},
	/**
	 * 恢复并执行挂起的操作
	 * @return {[type]} [description]
	 */
	resume:function(){
		var me=this;
		if(me.iC>0){
			me.iC--;
		}
		if(!me.iC){
			var list=me.iQ;
			if(list.length){
				var tasks=[].slice.call(me.iQ);
				me.iQ=[];
				while(tasks.length){
					me.idle(tasks.shift());
				}
			}else{
				me.trigger('idle');
			}
		}
	}
	/**
	 * 当window.location.href有改变化时触发
	 * @name Router.locationChanged 
	 * @event 
	 * @param {Object} e 事件对象
	 * @param {Object} e.location 地址解析出来的对象，包括query hash 以及 query和hash合并出来的params等
	 * @param {Object} e.changed 有哪些值发生改变的对象
	 * @param {Boolean} e.firstFired 标识是否是第一次强制触发的locationChanged，对于首次加载完Magix，会强制触发一次locationChanged
	 */

	/**
	 * 当router忙于更改window.location时触发
	 * @name Router.busy 
	 * @event 
	 * @param {Object} e 事件对象
	 */

	/**
	 * 当router更改完window.location，处于闲置状态时触发
	 * @name Router.idle 
	 * @event 
	 * @param {Object} e 事件对象
	 */
},Event);
	return Magix.mix(Router,IRouter);
},{
	requires:["magix/impl/router","magix/magix","magix/event"]
});/**
 * @fileOverview Vframe类
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/vframe',function(S,Magix,Event){
	var D=document;
var VframeIdCounter=0;

var safeExec=Magix.safeExec;

var DataView='data-view';

var $=function(id){
	return typeof id=='object'?id:D.getElementById(id);
};
var $$=function(id,tag){
	return $(id).getElementsByTagName(tag);
};
var $C=function(tag){
	return D.createElement(tag);
};
var ViewLoad='viewLoad';
var ChildrenCreated='childrenCreated';
/**
 * Vframe类
 * @name Vframe
 * @class
 * @constructor
 * @borrows Event.bind as this.bind
 * @borrows Event.trigger as this.trigger
 * @borrows Event.unbind as this.unbind
 * @param {HTMLElement} element dom节点
 * @property {String} id vframe id
 * @property {Array} children 子vframes
 * @property {View} view view对象
 * @property {VOM} owner VOM对象
 */
var Vframe=function(element){
	var me=this;
	me.id=Vframe.idIt(element);
	me.viewId=me.id+'_view';
	me.children=[];
	me.view=null;
	me.ready={o:{},c:0};
};
Magix.mix(Vframe,{
	/**
	 * @lends Vframe
	 */
	/**
	 * vframe 在页面上的标签名
	 * @type {String}
	 */
	tagName:'vframe',
	/**
	 * 给dom元素添加id
	 * @param {HTMLElement} dom dom节点
	 * @return {String} 节点的id
	 */
	idIt:function(dom){
		return dom.id||(dom.id='magix_vf_'+(VframeIdCounter++));
	},
	/**
	 * 创建Vframe对象
	 * @param {HTMLElement|String} element dom节点
	 * @param {Object} ops     其它属性
	 * @return {Vframe} 返回Vframe对象
	 */
	createVframe:function(element,ops){
		element=$(element);
		var vf=new Vframe(element);
		Magix.mix(vf,ops);
		return vf;
	},
	/**
	 * 创建vframe DOM节点
	 * @param {String} id     节点id
	 * @param {HTMLElement} before 插入在哪个节点前面
	 */
	createVframeNode:function(id,before){
		var vfNode=$C(Vframe.tagName);
		vfNode.id=id;
		before.parentNode.insertBefore(vfNode,before);
	}
});
/*
	修正IE下标签问题
	@2012.11.23
	暂时先不修正，如果页面上有vframe标签先create一下好了，用这么多代码代替一个document.createElement('vframe')太不值得
 */
/*(function(){
	var badVframes=$$(D,'/'+Vframe.tagName);
	var temp=[];
	for(var i=0,j=badVframes.length;i<j;i++){
		temp.push(badVframes[i]);
	}
	badVframes=temp;
	for(var i=0,j=badVframes.length;i<j;i++){
		var bVf=badVframes[i];
		var pv=bVf.previousSibling;
		var rVf=$C(Vframe.tagName);
		var pNode=pv.parentNode;
		var anchorNode=bVf.nextSibling;
		var vframeId;
		var vframeViewName;
		pNode.removeChild(bVf);
		temp=[];
		while(pv){
			if(pv.tagName&&pv.tagName.toLowerCase()==Vframe.tagName){
				vframeId=pv.id;
				vframeViewName=pv.getAttribute(DataView);
				pNode.removeChild(pv);
				break;
			}else{
				temp.push(pv);
				pv=pv.previousSibling;
			}
		}
		while(temp.length){
			rVf.appendChild(temp.pop());
		}
		pNode.insertBefore(rVf,anchorNode);
		if(vframeId){
			rVf.id=vframeId;
		}
		if(vframeViewName){
			rVf.setAttribute(DataView,vframeViewName);
		}
	}
}());*/
//
D.createElement(Vframe.tagName);

Magix.mix(Vframe.prototype,Event);
Magix.mix(Vframe.prototype,{
	/**
	 * @lends Vframe#
	 */
	/**
	 * 是否启用场景转场动画，相关的动画并未在该类中实现，如需动画，需要mxext/vfanim扩展来实现，设计为方法而不是属性可方便针对某些vframe使用动画
	 * @return {Boolean}
	 * @default false
	 */
	viewChangeUseAnim:function(){
		return false;
	},
	/**
	 * 转场动画时或当view启用刷新动画时，旧的view销毁时调用
	 * @function
	 */
	oldViewDestroy:Magix.noop,
	/**
	 * 转场动画时或当view启用刷新动画时，为新view准备好填充的容器
	 * @function
	 */
	prepareNextView:Magix.noop,
	/**
	 * 转场动画时或当view启用刷新动画时，新的view创建完成时调用
	 * @function
	 */
	newViewCreated:Magix.noop,
	/**
	 * 加载对应的view
	 * @param {String} viewName 形如:app/views/home 这样的名称
	 */
	mountView:function(viewName){
		var me=this;
		//me.owner.suspend();
		
		var useTurnaround=me.viewName&&me.viewChangeUseAnim();
		//
		me.unmountView(useTurnaround,true);
		if(viewName){
			me.viewName=viewName;
			//
			var callback=function(View){
				
				if(viewName!=me.viewName){
					return;//有可能在view载入后，vframe已经卸载了
				}

				View.wrapAsyncUpdate();

				var viewId;
				if(useTurnaround){
					viewId=me.viewId;
					me.prepareNextView();
				}else{
					viewId=me.id;
				}

				var view=new View({
					viewName:viewName,
					owner:me,
					ownerVOM:me.owner,
					id:viewId,
					vId:me.viewId,
					vfId:me.id
				});

				view.bind('ready',function(e){//view准备好后触发
					view.bind('created',function(){
						
						me.trigger(ViewLoad,{view:view},true);
						me.viewCreated=true;
					});	
					if(useTurnaround){
						me.newViewCreated(true);
					}
					if(!e.tmpl){
						me.loadSubVframes();
					}
					view.bind('rendered',function(){//再绑定rendered
						me.loadSubVframes();
					});
					view.bind('prerender',function(e){
						me.unloadSubVframes(e.anim);
					});
				});
				me.view=view;
				view.load();
			};
			Magix.libRequire(viewName,callback);
		}
		//me.owner.resume();
	},
	/**
	 * 销毁对应的view
	 * @param {Boolean} useAnim 是否启用动画，在启用动画的情况下，需要保持节点内容，不能删除
	 * @param {Boolean} isOutermostView 是否是最外层的view改变，不对内层的view处理
	 */
	unmountView:function(useAnim,isOutermostView){
		var me=this;
		//me.owner.suspend();
		if(me.view){
			me.unloadSubVframes(useAnim);
			me.view.destroy(useAnim);
			if(useAnim&&isOutermostView){//在动画启用的情况下才调用相关接口
				me.oldViewDestroy();
			}		
			delete me.view;
			delete me.viewName;
		}else if(me.viewName){//view有可能在未载入就进行了unmoutView
			me.unbind(ViewLoad);
			me.unbind(ChildrenCreated);
			delete me.viewName;
		}
		//me.owner.resume();
	},
	/**
	 * 加载当前view下面的子view，因为view的持有对象是vframe，所以是加载vframes
	 */
	loadSubVframes:function(){
		var me=this;
		/*
			为什么要挂起？
			<vframe data-view="app/views/main" id="J_main">
				<vframe data-view="app/view/left" id="J_left"></vframe>
				<vframe data-view="app/view/right" id="J_right"></vframe>
			</vframe>

			考虑缓存的情况下，非缓存的不考虑：
			渲染时，J_main渲染后，发现子view left和right，在渲染子view时，是顺序渲染的，所以先渲染left,在left的render中假如我们要postMessageTo right，而此时显示还没渲染到right，所以这个消息肯定发送不成功

			注：如果未挂起vframe在mount left时，load left后，render(suspend)->delegate events->callback(suspend)->fire ready->(vframe listener)->left(resume)->render(find right->NULL)->callback

			挂起后;
				
				vframe loadSubVframes:
					leftVframe->loadLeftView->leftViewSuspend->render(suspend)->delegate evetns->callback(suspend)->fire ready->(vframe listener)->leftViewResume->..外界仍然挂起，leftView挂起的render callback不执行

					rightVframe->loadRightView->rightViewSuspend->render(suspend)->delegate events->callback(suspend)->fire ready->(vframe listener)->rightViewResume->..

				vframe resume

					leftRender leftCallback rightRender rightCallback

		 */
		me.owner.suspend();
		var	node=$(me.viewId)||$(me.id);
		//
		var	vframes=node.getElementsByTagName(Vframe.tagName);
		var count=vframes.length;
		if(count){
			for(var i=0,vframe;i<count;i++){
				vframe=vframes[i];
				vframe=Vframe.createVframe(vframe,{
					owner:me.owner,
					parentId:me.id
				});
				me.children.push(vframe.id);
				me.owner.registerVframe(vframe);
				vframe.bind(ChildrenCreated,function(){
					var r=me.ready;
					var id=this.id;
					if(!Magix.hasProp(r.o,id)){
						r.o[id]=1;
						r.c++;
					}
					if(r.c==me.children.length){
						me.ready={o:{},c:0};
						me.notifyChildrenCreated();
					}
				});
				vframe.mountView(vframes[i].getAttribute(DataView));
			}
		}else{
			me.notifyChildrenCreated();
		}
		me.owner.resume();
	},
	/**
	 * 销毁当前view下面的所有子vframes
	 * @param {Boolean} useAnim 是否使用动画，使用动画时DOM节点不销毁
	 */
	unloadSubVframes:function(useAnim){
		var me=this;
		var children=me.children;
		var child;
		for(var i=0,j=children.length,id;i<j;i++){
			id=children[i];
			//
			child=me.owner.getVframe(id);
			child.unmountView(useAnim);
			me.owner.unregisterVframe(child);
			$(id).id='';
		}
		me.children=[];
	},
	/**
	 * 向某个vframe发送消息
	 * @param {Array|String} aim  目标vframe id数组
	 * @param {Object} args 消息对象
	 */
	postMessageTo:function(aim,args){
		var me=this;
		//me.owner.idle(function(){//在外部闲置状态下才进行后续的处理
		var vom=me.owner;
		if(!Magix.isArray(aim)){
			aim=[aim];
		}
		if(!args)args={};
		
		for(var i=0;i<aim.length;i++){
			var vframe=vom.getVframe(aim[i]);
			
			if(vframe){
				var view=vframe.view;
				if(view&&view.rendered){//表明属于vframe的view对象已经加载完成
					/*
						考虑
						<vframe id="v1" data-view="..."></vframe>
						<vframe id="v2" data-view="..."></vframe>
						<vframe id="v3" data-view="..."></vframe>
						
						v1渲染后postMessage向v2 v3发消息，此时v2 v3的view对象是构建好了，但它对应的模板可能并未就绪，需要等待到view创建完成后再发消息过去
					 */
					//if(view.rendered){
						safeExec(view.receiveMessage,args,view);
					/*}else{ //使用ViewLoad
						view.bind('created',function(){
							safeExec(this.receiveMessage,args,this);
						});
					}	*/				
				}else if(vframe.viewName){//经过上面的判断，到这一步说明开始加载view但尚未加载完成
					/*
						Q:当vframe没有view属性但有viewName表明属于这个vframe的view异步加载尚未完成，但为什么还要向这个view发送消息呢，丢弃不可以吗？

						A:考虑这样的情况，页面上有A B两个view，A在拿到数据完成渲染后会向B发送一个消息，B收到消息后才渲染。在加载A B两个view时，是同时加载的，这两个加载是异步，A在加载、渲染完成向B发送消息时，B view对应的js文件很有可能尚未载入完成，所以这个消息会由B vframe先持有，等B对应的view载入后再传递这个消息过去。如果不传递这个消息则Bview无法完成后续的渲染。vframe是通过对内容分析立即就构建出来的，view是对应的js加载完成才存在的，因异步的存在，所以需要这样的处理。
					 */
					vframe.bind(ViewLoad,function(e){
						safeExec(e.view.receiveMessage,args,e.view);
					});
				}//没view也没viewName，可能这个vframe是一个空的或者已经销毁，忽略掉这个消息
			}
		}
		//});	
	},
	/**
	 * 通知当前vframe，地址栏发生变化
	 * @param {Object} e 事件对象
	 * @param {Object} e.location window.location.href解析出来的对象
	 * @param {Object} e.changed 包含有哪些变化的对象
	 */
	notifyLocationChange:function(e){
		var me=this;
		var view=me.view;
		/*
			重点：
				所有手动mountView的都应该在合适的地方中断消息传递：
			示例：
				<div id="magix_vf_root">
					<vframe data-view="app/views/leftmenus" id="magix_vf_lm"></vframe>
					<vframe id="magix_vf_main"></vframe>
				</div>
			默认view中自动渲染左侧菜单，右侧手动渲染

			考虑右侧vframe嵌套并且缓存的情况下，如果未中断消息传递，有可能造成新渲染的view接收到消息后不能做出正确反映，当然左侧菜单是不需要中断的，此时我们在locationChange中
			  return ["magix_vf_lm"];

			假设右侧要这样渲染：
				<vframe data-view="app/views/home/a" id="vf1"></vframe>

			接收消息渲染main时：
				locChanged(先通知main有loc变化，此时已经知道main下面有vf1了)
					|
				mountMainView(渲染main)
					|
				unmountMainView(清除以前渲染的)
					|
				unmountVf1View(清除vf1)
					|
				mountVf1View(main渲染完成后渲染vf1)
					|
				locChangedToA(继续上面的循环到Vf1)

				error;
			方案：
				0.3版本中采取的是在mount某个view时，先做销毁时，直接把下面的子view递归出来，一次性销毁，但依然有问题，销毁完，再渲染，此时消息还要向后走（看了0.3的源码，这块理解的并不正确）

				0.3把块放在view中了，在vom中取出vframe，但这块的职责应该在vframe中做才对，view只管显示，vframe负责父子关系
		 */
		if(view&&view.exist&&view.rendered){//存在view时才进行广播，对于加载中的可在加载完成后通过调用view.getLocation()拿到对应的window.location.href对象，对于销毁的也不需要广播
			var isChanged=safeExec(view.testObserveLocationChanged,e,view);
			if(isChanged){//检测view所关注的相应的参数是否发生了变化
				//safeExec(view.render,[],view);//如果关注的参数有变化，默认调用render方法
				//否定了这个想法，有时关注的参数有变化，不一定需要调用render方法
				var res=safeExec(view.locationChange,e,view);
			}
			if(res!==false){//不为false继续向子vframe传递消息
				if(!Magix.isArray(res)){
					res=me.children;
				}
				for(var i=0,j=res.length,vf;i<j;i++){
					vf=me.owner.getVframe(res[i]);
					if(vf){
						safeExec(vf.notifyLocationChange,e,vf);
					}
				}
			}
		}
	},
	/**
	 * 通知所有的子view创建完成
	 */
	notifyChildrenCreated:function(){
		var me=this;
		var fn=function(){
			var view=me.view;
			if(view){
				safeExec(view.trigger,ChildrenCreated,view);
			}
			
			me.trigger(ChildrenCreated,0,true);
		}
		if(me.viewCreated)fn();
		else me.bind(ViewLoad,fn);
	}
	/**
	 * view加载完成时触发
	 * @name Vframe#viewLoad 
	 * @event
	 * @param {Object} e view加载完成后触发
	 * @param {Object} e.view 加载的view对象
	 */
});
	return Vframe;
},{
	requires:["magix/magix","magix/event"]
});/**
 * @fileOverview view类
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/view',function(S,IView,Magix,Event){
	var counter=1;
var safeExec=Magix.safeExec;
var HAS=Magix.hasProp;
var EMPTY='';
/**
 * View类
 * @name View
 * @class
 * @constructor
 * @borrows Event.bind as this.bind
 * @borrows Event.trigger as this.trigger
 * @borrows Event.unbind as this.unbind
 * @param {Object} ops 创建view时，需要附加到view对象上的其它属性
 * @property {Object} events 事件对象
 * @property {Boolean} exist 标识当前view是否存在，有没有被销毁
 * @property {String} id 当前view与页面vframe节点对应的id
 * @property {Vframe} owner 拥有当前view的vframe对象
 * @property {String} template 当前view对应的模板字符串(当hasTemplate不为false时)，该属性在created事件触发后才存在
 * @example
 * 关于View.prototype.events:
 * 示例：
 *   html写法：
 *   
 *   &lt;input type="button" mxclick="test:100@id:xinglie@name" value="test" /&gt;
 *   &lt;a href="http://etao.com" mxclick="test:etao.com:_prevent_"&gt;http://etao.com&lt;/a&gt;
 *
 * 	 view写法：
 * 	 
 *   events:{
 *   	click:{
 *   		test:function(e){
 *   			//e.view  当前view对象
 *   			//e.currentId 处理事件的dom节点id
 *   			//e.targetId 触发事件的dom节点id
 *   			//e.events  view.events对象，可访问其它事件对象，如：e.events.mousedown.test
 *   			//e.params  传递的参数
 *   			//如果在html上写：mxclick="test:etao.com:_prevent_"，用冒号分割的一个字符串，第1个冒号前的表示要调用的方法。当最后一个是_prevent_（调用e.preventDefault）,_stop_（调用e.stopPropagation）,_halt_（阻止默认行为和冒泡）时，丢弃最后一个，把etao.com做为参数传入，可以用e.params[0]获取
 *   			//如果是mxclick="test:100@id:xinglie@name"时，可以用e.params.id e.params.name取得相应的值，这样更直观些
 *   		}
 *   	},
 *   	mousedown:{
 *   		test:function(e){
 *   			
 *   		}
 *   	}
 *   }
 */
var WrapAsyncUpdateNames=['render','renderUI','updateUI'];

var View=function(ops){
	var me=this;
	Magix.mix(me,ops);
	me.exist=true;
	me.iQ=[];
	me.iC=0;
	me.sign=0;//标识view是否刷新过，对于托管的函数资源，在回调这个函数时，不但要确保view没有销毁，而且要确保view没有刷新过，如果刷新过则不回调
};
var BaseViewProto=View.prototype;
var WrapKey='~~';
var WrapFn=function(fn,update){
	return function(){
		var me=this;
		var args=arguments;
		me.idle(function(){
			if(update){
				me.sign++;
			}
			//
			fn.apply(me,args);
		});
	}
};
/*
	var cases=[
	    'xx\n return ;',
	    'return a',
	    'return {',
	    'return  \r\n',
	    'return{',
	    'return(',
	    'return[',
	    'return   {',
	    'return      [',
	    'return    (',
	    'return;',
	    'return\r\n',
	    'return/\\s+/',
	    'var returned',
	    'xreturn a',
	    'return ""',
	    'return""',
	    'return\'\'',
	    'return \'\''
	];
 */
var ReturnedReg=/(?:^|\s)return(?:(?:\s+[+\-\w$'"{\[\(\/])|[+\-{\[\(\/'"])/;
var FnBodyReg=/{([\s\S]+)}/;
var TransReg=/\\[\s\S]/g;
var LS=/\s*\/\s*/g;
var SpaceReg=/^[\s\xa0\u3000\uFEFF]*$/;
var Trims=[
	/[^\w$_]\/[\s\S]*?\//,//简单识别正则
	/(?:'[^']*')|(?:"[^"]*")/,//简单识别字符串
	/{[^{}]+}/ //简单识别大括号
]
/*
	识别函数有没有返回值
	思路：
		考虑这样的函数：
		function test(){
			function inner(){
				return true;
			}
			var r=inner();
		}
	我们不能简单判断函数体内是否有return，考虑上面的函数，有可能里面内部的函数有return 外面的没有return
	解决办法是把函数体拿出来
	去掉所有成对出现的{}及它们之间的内容
	然后再识别剩下的是否有return

	function test(){
		function a(){
			return 'xxx{'
		}
		var e;
	}

	像上面的这种其实会识别错误，但这样的情况出现的很少
	也不是所有的方法都需要进行idle包装，因此忽略

	2012.11.22
	对于上面的情况，我们最好修正下，防止隐患
	修改方案为：
	先去掉 \后跟的字符，去掉转义的（这样也会去掉正则里面的）
	去除字符串
	去除大括号
	最后判断

	Y的 还有个正则

	function(){
		function a(){
		  var a=/\r\n\\"\//;
			return '\r\n\\\' return xxx{'
		}
		var e;
	}

	把正则跟字符串一起处理了
 */
var ReturnedSthOrEmpty=function(fn){
	fn=String(fn);
	var body=fn.match(FnBodyReg);
	if(body){
		body=body[1];
		if(SpaceReg.test(body))return true;
		body=body.replace(TransReg,EMPTY).replace(LS,EMPTY);
		for(var i=0,reg;i<Trims.length;i++){
			reg=Trims[i];
			while(reg.test(body)){
				body=body.replace(reg,EMPTY);
			}
		}
		return ReturnedReg.test(body);
	}
	return false;
};
Magix.mix(View,{
	/**
	 * @lends View
	 */
	/**
	 * 给dom节点添加id
	 * @param {HTMLElement} dom html节点
	 * @return {String} 节点id
	 */
	idIt:function(dom){
		return dom.id||(dom.id='magix_mxe_'+(counter++));
	},
	/**
	 * 对异步更新view的方法进行一次包装
	 */
	wrapAsyncUpdate:function(){
		var view=this;
		if(!view[WrapKey]){//只处理一次
			view[WrapKey]=1;
			var prop=view.prototype;
			var old;
			view.registerAsyncUpdateName();
			for(var p in prop){
				old=prop[p];
				var wrap=null;
				//包装function时，需要规避有返回内容的函数，有返回的通常都需要同步调用，因此不能包装
				if(Magix.isFunction(old)&&old!=Magix.noop&&!old[WrapKey]&&!ReturnedSthOrEmpty(old)){
					if(HAS(view.$ans,p)){
						wrap=WrapFn(old,true);
					}else if(HAS(prop,p)&&!HAS(BaseViewProto,p)){//对继承的原型上的方法进行处理，不对基类里面的处理
						wrap=WrapFn(old);
					}
					if(wrap){
						wrap[WrapKey]=old;
						prop[p]=wrap;
					}
				}
			}
		}
	},
	/**
	 * 注册view类中哪些方法是异步更新的方法，默认已注册render renderUI updateUI三个方法
	 * @param {Array|String} names 方法名字符串或字符串数组
	 * @see View#beginAsyncUpdate
	 */
	registerAsyncUpdateName:function(names){
		var me=this;
		if(!me.$ans){
			me.$ans={};
			for(var i=0;i<WrapAsyncUpdateNames.length;i++){
				me.$ans[WrapAsyncUpdateNames[i]]=true;
			}
		}
		if(names){
			if(!Magix.isArray(names))names=[names];
			for(var i=0;i<names.length;i++){
				me.$ans[names[i]]=true;
			}
		}
		return me;
	}
});

var UnsupportBubble={
	blur:1,
	focus:1,
	focusin:1,
	focusout:1,
	mouseenter:1,
	mouseleave:1,
	mousewheel:1,
	valuechange:1
};
var VProto=View.prototype;
var D=document;
var WIN=window;
var DestroyManagedTryList=['abort','stop','cancel','destroy','dispose'];
var $=function(id){
	return typeof id=='object'?id:D.getElementById(id);
};

Magix.mix(VProto,Event);

Magix.mix(VProto,{
	/**
	 * @lends View#
	 */
	/**
	 * 使用xhr获取当前view对应的模板内容，仅在开发app阶段时使用，打包上线后html与js打包在一起，不会调用这个方法
	 * @function
	 * @param {String} path 路径
	 * @param {Function} fn 获取完成后的回调
	 */
	getTmplByXHR:Magix.unimpl,
	/**
	 * 代理不冒泡的事件
	 * @function
	 */
	delegateUnbubble:Magix.unimpl,
	/**
	 * 取消代理不冒泡的事件
	 * @function
	 */
	undelegateUnbubble:Magix.unimpl,
	/**
	 * 渲染view，供最终view开发者覆盖
	 * @function
	 */
	render:Magix.noop,
	/**
	 * 当window.location.href有变化时调用该方法（如果您通过observeLocation指定了相关参数，则这些相关参数有变化时才调用locationChange，否则不会调用），供最终的view开发人员进行覆盖
	 * @function
	 * @param {Object} e 事件对象
	 * @param {Object} e.location window.location.href解析出来的对象
	 * @param {Object} e.changed 包含有哪些变化的对象
	 */
	locationChange:Magix.noop,
	/**
	 * 用于接受其它view通过postMessageTo方法发来的消息，供最终的view开发人员进行覆盖
	 * @function
	 * @param {Object} e 通过postMessageTo传递的第二个参数
	 */
	receiveMessage:Magix.noop,
	/**
	 * 初始化方法，供最终的view开发人员进行覆盖，注意：不要在该方法内进行异步数据获取，init仅适用于事件绑定等(init何时被调用？init在view进行一系列的初始化后，在view的created事件后被调用，此时已完成界面的创建。为什么要设计的这么靠后？view没被创建出来前，是不能做其它动作的，如果在此之前调用了init，而用户可以在init中做其它的动作，假设view还未创建完成就销毁，会给销毁带来一定的麻烦)
	 * @function
	 */
	init:Magix.noop,
	/**
	 * 标识当前view是否有模板文件
	 * @default true
	 */
	hasTemplate:true,
	/**
	 * 是否启用DOM事件(events对象指定的事件是否生效)，注意：如果初始化时就为false则不注册代理事件，后续无法通过enableEvent=true启用事件。
	 * @default true
	 * @example
	 * 该属性在做浏览器兼容时有用：支持pushState的浏览器阻止a标签的默认行为，转用pushState，不支持时直接a标签跳转，view不启用事件
	 * Q:为什么不支持history state的浏览器上还要使用view？
	 * A:考虑 http://etao.com/list?page=2#!/list?page=3; 在IE6上，实际的页码是3，但后台生成时候生成的页码是2，<br />所以需要magix/view载入后对相应的a标签链接进行处理成实际的3。用户点击链接时，由于view没启用事件，不会阻止a标签的默认行为，后续才是正确的结果
	 */
	enableEvent:true,
	/**
	 * view刷新时是否采用动画
	 * @type {Boolean}
	 */
	enableRefreshAnim:false,
	/**
	 * 加载view内容
	 */
	load:function(){
		var me=this;
		//if(me.$loaded)return;
		//me.$loaded=true;
		var ready=function(){
			//me.owner.owner.suspend();
			me.suspend();
			/*
				挂起后render方法无法立即执行
			 */
			safeExec(me.render,[],me);
			/*
				为什么要挂起？下面的代码为什么要放在idle的回调里面？

				<vframe id="magix_vf_root">
					<## <vframe id="magix_vf_1" data-view="..."></vframe> ##>
				</vframe>
				
				<## ##>表示是magix_vf_root的view载入后，通过setViewHTML添加的

				在magix_vf_root的render中，如果要调用postMessageTo向vf_1发消息，vf_1接受不到，因为set完后，Vframe还没有建立起相应的vframe对象：
				
				用户重写了render方法：

					代理冒泡事件
					    |
					通知准备完成（vframe接收，有模板时见@1，如果view无模板时见@2）
					    |
					调用init初始化
					    |
					调用render方法（有可能调用setViewHTML方法）
					    |
					调用下面的匿名函数（函数内有判断是否调用了setViewHTML方法）

				@1 用户重写了render方法后，vframe接收ready事件：
					
					ready
					    |
					加载子view(此时尚未有内容，所以暂时找不到子view)
					    |
					绑定prerender与rendered事件
					    |
					当view调用setViewHTML方法后则后续正常执行
				
				@2
				     ready
				        |
				     加载子view（模板在页面上，所以会执行，有子view时则加载）
				        |
				     绑定prerender与rendered事件

				用户未重写render方法：
					
					调用render空方法
					    |
					代理冒泡事件
					    |
					通知创建完成（vframe接收，有模板时见@1，如果view无模板时见@2）
					    |
					调用init初始化
					    |
					调用下面的匿名函数（函数内有判断是否调用了setViewHTML方法）

				如果在view render中要访问其它vframe时，应放在idle回调内，如：

				me.idle(funciton(){
					VOM.getVframe('magix_vf_2');
				});

				其它常用方法如postMessageTo则不需要放在idle的回调内（view中已处理）


				以上是对于有缓存的view，比如调用render方法时，是同步渲染出来的。

				#2012.11.25
				  cache:ready->(vframe.loadSubVframes)->render(postMessage,idle)->setViewHTML->(prerender,rendered)->(unload,loadSubVframes)->resume;
				  nocache:ready->(vframe.loadSubVframes)->render(async back[postMessage idle])->resume()
				          tmplReady->setViewHTML->(prerender,rendered)->(unload,loadSubVframes)->postMessage idle

			 */
			me.delegateBubbleEvents();
			me.idle(function(){
				//
				if(!me.rendered){//监视有没有在调用render方法内使用setViewHTML更新view，对于没有模板的view，是不需要调用的，此时我们需要添加不冒泡的事件处理，如果调用了，则在setViewHTML中处理，首次就不再处理了，只有冒泡的事件才适合在首次处理
					me.delegateUnbubbleEvents();
					me.rendered=true;
				}
				safeExec(me.init,[],me);
				me.trigger('created',null,true);//先注册的事件先调用
				var mxConfig=Magix.config();
				var fn=mxConfig.viewLoad;
				if(Magix.isFunction(fn)){
					safeExec(fn,{name:me.viewName,location:me.getLocation()});
				}
			});
			me.trigger('ready',{tmpl:me.hasTemplate},true);//已就绪
			me.resume();
			//me.owner.owner.resume();
		};
		if(me.hasTemplate){
			me.getTemplate(me.manage(function(tmpl){//模板获取也是异步的，防止模板没取回来时，view已经销毁或刷新了
				me.template=tmpl;
				ready();
			}));
		}else{
			ready();
		}
	},
	/**
	 * 更新view的id，在启用动画的情况下，内部会做id转换
	 */
	updateViewId:function(){
		var me=this;
		if($(me.vId)){
			me.id=me.vId;
		}else{
			me.id=me.vfId;
		}
	},
	/**
	 * 设置view节点的html内容，供子类重写
	 * @param {Strig} html html字符串
	 */
	setNodeHTML:function(html){
		var me=this;
		$(me.id).innerHTML=html;
	},
	/**
	 * 设置view的html内容
	 * @param {Strig} html html字符串
	 */
	setViewHTML:function(param){
		var me=this;
		if(me.exist){
			me.trigger('refresh',null,true,true);//从最后注册的事件一直清到最先注册的事件
			var mxConfig=Magix.config();
			

			var enableAnim=mxConfig.viewChangeAnim&&me.rendered&&me.enableRefreshAnim;//渲染过才使用动画

			me.trigger('prerender',{anim:enableAnim});

			//
			me.destroyManaged(true);
			me.undelegateUnBubbleEvents();
			me.destroyFrames();
			

			var owner=me.owner;
			if(enableAnim){
				safeExec(owner.oldViewDestroy,[],owner);
				safeExec(owner.prepareNextView,[],owner);
				me.updateViewId();
			}
			if(!me.rendered){
				me.$bakHTML=$(me.id).innerHTML;
			}

			me.setNodeHTML(param);

			if(enableAnim){
				safeExec(owner.newViewCreated,[],owner);
			}
			me.delegateUnbubbleEvents();
			me.rendered=true;
			me.trigger('rendered');//可以在rendered事件中访问view.rendered属性
		}
	},
	/**
	 * 向某个view发送消息
	 * @param {Array|String} aim  发送的目标id或id数组
	 * @param {Object} args 消息对象
	 */
	postMessageTo:function(aim,args){
		var me=this;
		me.idle(me.owner.postMessageTo,[aim,args],me.owner);
	},
	/**
	 * 当view处于闲置状态时回调传入的fn
	 * @param {Function} fn 闲置时的回调函数
	 * @param {Array} [args] 参数
	 * @param {Object} [context] fn内this指向
	 * @example
	 * //idle的应用场景：
	 *
	 * update:function(){
	 * 		var loc=this.getLocation();
	 * 		
	 * }
	 * //...
	 * click:{
	 * 		create:function(e){
	 * 			Router.navigate({a:'b',c:'d'});//此处的更改是异步的
	 * 			e.view.update();//在0.3版的magix中，这样写在update方法内无法立即得到a的值
	 * 		}
	 * }
	 * //上面create中安全的使用方式是这样的：
	 * Router.navigate({a:'b',c:'d'});
	 * e.view.idle(function(){
	 * 		e.view.update();
	 * });
	 *
	 * //但是这样的书写明显会带来不方便，需要开发者明白哪些地方是异步的，哪些地方是同步的
	 * //所以view会对原型链上的方法进行一次处理，magix 1.0版自动帮你包装一下相关的方法，包装后：
	 *
	 * Router.navigate({a:'b',c:'d'});
	 * e.view.update();//此update是包装后的方法，会等到Router修改完成url后才调用
	 *
	 * //view在包装原型链上的方法时，对明确有返回值的方法不进行包装
	 * //因此下面的情景并不能自动处理，您需要手动判断：
	 *
	 * getParams:function(){
	 * 		var loc=this.getLocation();
	 * 		//...
	 * 		return newLocParams;//该方法有返回值，无法异步调用
	 * }
	 * //...
	 * click:{
	 * 		create:function(e){
	 * 			Router.navigate({a:'b',c:'d'});//此处的更改是异步的
	 * 			var params=e.view.getParams();//无法在getParams方法内部拿到最新的a和c的值
	 * 			//对于上面这一行需要修改成：
	 * 			e.view.idle(function(){
	 * 				var params=e.view.getParams();
	 * 			});
	 * 			//对于getParams方法如果内部没有访问location也是不需要在idle回调中执行的
	 * 			
	 * 		}
	 * }
	 *
	 * //magix已经尽最大可能解决掉了异步问题，而在项目中一般很少出现上面的情景
	 * //因此您不需要考虑每个动作都放在idle里面，出现问题了再考虑
	 *
	 * //在方法内如果没有访问location也是不需要在idle回调中执行的
	 * //忘掉这个方法的存在吧~~
	 *
	 * //
	 */
	idle:function(fn,args,context){
		var me=this;
		if(me.iC){
			me.iQ.push([fn,args,context]);
		}else{
			me.ownerVOM.idle(function(){//在应用中，有可能是在异步中回调，为了防止应用中没有做判断，所以在此做下判断，只有view存在的情况下才调用
				if(me.exist&&Magix.isFunction(fn)){
					safeExec(fn,args,context);
				}
			});
		}
	},
	/**
	 * 获取window.location.href解析后的对象
	 * @return {Object}
	 */
	getLocation:function(){
		var me=this;
		return me.ownerVOM.$location;
	},
	/**
	 * 指定要监视地址栏中的哪些值有变化时，当前view的locationChange才会被调用。通常情况下location有变化就会引起当前view的locationChange被调用，但这会带来一些不必要的麻烦，所以你可以指定地址栏中哪些值有变化时才引起locationChange调用，使得view只关注与自已需要刷新有关的参数
	 * @param {Array|String} keys            key数组或字符串
	 * @param {Boolean} observePathname 是否监视pathname
	 * @example
	 * return View.extend({
	 * 		init:function(){
	 * 			this.observeLocation('page,rows',true);//关注地址栏中的page rows2个参数的变化，并且关注pathname的改变，当其中的任意一个改变时，才引起当前view的locationChange被调用
	 * 		},
	 * 		locationChange:function(e){
	 * 			if(e.changed.isParam('page')){};//检测是否是page发生的改变
	 * 			if(e.changed.isParam('rows')){};//检测是否是rows发生的改变
	 * 			if(e.changed.isPathname()){};//是否是pathname发生的改变
	 * 		}
	 * });
	 */
	observeLocation:function(keys,observePathname){//区分params与pathname
		var me=this;
		var args=arguments;
		if(args.length==1){
			observePathname=false;
		}
		if(args.length){
			me.$location={
				keys:Magix.isArray(keys)?keys:String(keys).split(','),
				pn:observePathname
			};
		}
	},
	/**
	 * 检测通过observeLocation方法指定的key对应的值有没有发生变化
	 * @param {Object} e Router.locationChanged事件对象
	 * @return {Boolean} 是否发生改变
	 */
	testObserveLocationChanged:function(e){
		var me=this;
		var location=me.$location;
		var changed=e.changed;
		if(location){
			var res=false;
			if(location.pn){
				res=changed.isPathname();
			}
			if(!res){
				var keys=location.keys;
				for(var i=0;i<keys.length;i++){
					var key=keys[i];
					if(changed.isParam(key)){
						res=true;
						break;
					}
				}
			}
			return res;
		}
		return true;
	},
	/**
	 * 销毁当前view内的iframes 
	 */
	destroyFrames:function(){
		var me=this;
		var node=$(me.id),
			iframes=node.getElementsByTagName('iframe'),
			iframe, parent;
        while (iframes.length) {
            iframe = iframes[0];
            parent = iframe.parentNode;
            iframe.src = EMPTY; // 似乎是关键步骤
            parent.removeChild(iframe);
            //parent.parentNode.removeChild(parent);
            iframe = parent = null;
        }
        if(WIN.CollectGarbage){
        	WIN.CollectGarbage();
        }
	},
	/**
	 * 销毁当前view
	 * @param {Boolean} [keepContent] 销毁view时，是否保留内容，默认对于有模板的view才删除内容，没有模板的是不做删除处理的
	 */
	destroy:function(keepContent){
		var me=this;
		me.trigger('refresh',null,true,true);//先清除绑定在上面的app中的刷新
		me.trigger('destroy',null,true,true);//同上
		me.destroyManaged();
		me.undelegateUnBubbleEvents();
		me.undelegateBubbleEvents();
		if(me.hasTemplate&&!keepContent){
			me.destroyFrames();
			//
			$(me.vfId).innerHTML=me.$bakHTML||EMPTY;
		}
		//me.unbind('prerender',null,true); 销毁的话也就访问不到view对象了，这些事件不解绑也没问题
		//me.unbind('rendered',null,true);
		me.exist=false;
		me.iQ=[];
		me.sign++;
		//
	},
	/**
	 * 获取当前view对应的模板
	 * @param {Function} fn 取得模板后的回调方法
	 */
	getTemplate:function(fn){
		var me=this;
		if(me.template){
			fn(me.template);
		}else{
			var tmpl=Magix.templates[me.viewName];
			if(tmpl){
				fn(tmpl);
			}else{
				var mxConfig=Magix.config();
				var isReleased=mxConfig.release;

				var path=mxConfig.appHome+me.viewName+'.html';
				if(!isReleased){
					path+='?_='+new Date().getTime();
				}
				me.getTmplByXHR(path,function(tmpl){
					fn(Magix.templates[me.viewName]=tmpl);
				});
			}
		}
	},
	/**
	 * 处理dom事件
	 * @param {Event} e dom事件对象
	 */
	processEvent:function(e){
		var me=this;
		if(me.enableEvent&&me.exist){
			var target=e.target;
			var current=target;
			while(current.nodeType!=1){
				current=current.parentNode;
			}
			var type='mx'+e.type;
			var info=current.getAttribute(type);
			var node=$(me.vfId);

			while(!info&&current!=node){//跨vframe的咱也不处理
				current=current.parentNode;
				info=current.getAttribute(type);
			}
			/*var begin=current;
			while(begin!=node){
				if(begin.tagName==node.tagName){
					info=0;
				}
				begin=begin.parentNode;
			}*/
			if(info){
				var infos=info.split(':');
				var evtName=infos.shift();
				var flag=infos[infos.length-1];
				var needPop;
				var id=View.idIt(current);
				if(flag=='_halt_'||flag=='_stop_'){
					e.stopPropagation();
					needPop=true;
				}
				if(flag=='_halt_'||flag=='_prevent_'){
					e.preventDefault();
					needPop=true;
				}
				if(needPop)infos.pop();

				var events=me.events;
				var eventsType=events[e.type];
				//
				for(var i=0,atPos;i<infos.length;i++){
					atPos=infos[i].lastIndexOf('@');
					if(atPos>-1){
						infos[infos[i].substring(atPos+1)]=infos[i].substring(0,atPos);
					}
				}
				if(eventsType[evtName]){
					safeExec(eventsType[evtName],{
						view:me,
						currentId:id,
						targetId:View.idIt(target),
						domEvent:e,
						events:events,
						params:infos
					},eventsType);
					
				}
			}
		}
	},
	/**
	 * 修正dom事件对象，主要是对IE的修正，添加如target preventDefault等
	 * @param {event} e dom事件对象
	 * @return {event} dom事件对象
	 */
	fixedEvent:function(e){
		if(!e)e=WIN.event;
		if(e){
			if(!e.stopPropagation){
				e.stopPropagation=function(){
					e.cancelBubble=true;
				}
			}
			if(!e.preventDefault){
				e.preventDefault=function(){
					e.returnValue=false;
				}
			}
			if(e.srcElement&&!e.target){
				e.target=e.srcElement;
			}
		}
		return e;
	},
	/**
	 * 处理代理事件
	 * @param {Boolean} bubble  是否冒泡的事件
	 * @param {Boolean} dispose 是否销毁
	 */
	processDelegateEvents:function(bubble,dispose){
		var me=this;
		var viewName=me.viewName;
		if(me.enableEvent){
			var events=me.events;
			var node=$(me.vfId);
			if(me.$bubbleList&&me.$unbubbleList){
				var list=bubble?me.$bubbleList:me.$unbubbleList;
				for(var i=0;i<list.length;i++){
					if(bubble){
						if(dispose){
							node['on'+list[i]]=null;
						}else{
							node['on'+list[i]]=function(e){
								//
								e=me.fixedEvent(e);
								me.processEvent(e);
							}
						}
					}else{
						if(dispose){
							me.undelegateUnbubble(node,list[i]);
						}else{
							me.delegateUnbubble(node,list[i]);
						}
					}
				}
			}else{
				me.$bubbleList=[];
				me.$unbubbleList=[];
				for(var p in events){
					if(HAS(events,p)){
						if(HAS(UnsupportBubble,p)){
							me.$unbubbleList.push(p);
							if(!bubble){
								if(dispose){
									me.undelegateUnbubble(node,p);
								}else{
									me.delegateUnbubble(node,p);
								}
							}
						}else{
							me.$bubbleList.push(p);
							if(bubble){
								if(dispose){
									node['on'+p]=null;
								}else{
									node['on'+p]=function(e){
										//

										e=me.fixedEvent(e);
										me.processEvent(e);
									}
								}
							}
						}
					}
				}
			}
		}
	},
	/**
	 * 代理dom冒泡事件
	 */
	delegateBubbleEvents:function(){
		this.processDelegateEvents(true);
	},
	/**
	 * 代理dom不冒泡事件
	 */
	delegateUnbubbleEvents:function(){
		this.processDelegateEvents()
	},
	/**
	 * 取消代理dom不冒泡事件
	 */
	undelegateUnBubbleEvents:function(){
		this.processDelegateEvents(false,true);
	},
	/**
	 * 取消代理dom冒泡事件
	 */
	undelegateBubbleEvents:function(){
		this.processDelegateEvents(true,true);
	},
	/**
	 * 让view帮你管理资源，对于异步回调函数更应该调用该方法进行托管
	 * 当调用该方法后，您不需要在异步回调方法内判断当前view是否已经销毁
	 * 同时对于view刷新后，上个异步请求返回刷新界面的问题也得到很好的解决。<b>强烈建议对异步回调函数，组件等进行托管</b>
	 * @param {String|Object} key 托管的资源或要共享的资源标识key
	 * @param {Object} [res] 要托管的资源
	 * @return {Object} 返回传入的资源，对于函数会自动进行一次包装
	 * @example
	 * init:function(){
	 * 		this.manage('user_list',[//管理对象资源
	 * 			{id:1,name:'a'},
	 * 			{id:2,name:'b'}
	 * 		]);
	 * },
	 * render:function(){
	 * 		var _self=this;
	 * 		var m=new Model();
	 * 		m.load({
	 * 			success:_self.manage(function(resp){//管理匿名函数
	 * 				//TODO
	 * 				var brix=new BrixDropdownList();
	 *
	 * 				_self.manage(brix);//管理组件
	 *
	 * 				var pagination=_self.manage(new BrixPagination());//也可以这样
	 *
	 * 				var timer=_self.manage(setTimeout(function(){
	 * 					S.log('timer');
	 * 				},2000));//也可以管理定时器
	 *
	 * 				
	 * 				var userList=_self.getManaged('user_list');//通过key取托管的资源
	 *
	 * 				S.log(userList);
	 * 			}),
	 * 			error:_self.manage(function(msg){
	 * 				//TODO
	 * 			})
	 * 		})
	 * }
	 */
	manage:function(key,res){
		var me=this;
		var args=arguments;
		var hasKey=true;
		if(args.length==1){
			res=key;
			key='res_'+(counter++);
			hasKey=false;
		}
		if(!me.$resCache)me.$resCache={};
		var wrapObj={
			hasKey:hasKey,
			res:res
		};
		if(Magix.isFunction(res)){
			res=me.wrapManagedFunction(res);
			wrapObj[me.sign]=res;
		}
		me.$resCache[key]=wrapObj;
		return res;
	},
	/**
	 * 获取托管的资源
	 * @param {String} key 托管资源时传入的标识key
	 * @return {[type]} [description]
	 */
	getManaged:function(key){
		var me=this;
		var cache=me.$resCache;
		var sign=me.sign;
		if(cache&&HAS(cache,key)){
			var wrapObj=cache[key];
			var resource=wrapObj.res;
			if(Magix.isFunction(resource)){//托管的是方法，取出用时，依然要考虑view刷新问题，当view刷新后，这个方法是需弃用的
				if(!wrapObj[sign]){
					wrapObj[sign]=me.wrapManagedFunction(resource);
				}
				resource=wrapObj[sign];
			}
			return resource;
		}
		return null;
	},
	/**
	 * 移除托管的资源
	 * @param {String|Object} param 托管时标识key或托管的对象
	 */
	removeManaged:function(param){
		var me=this;
		var cache=me.$resCache;
		if(cache){
			if(HAS(cache,param)){
				delete cache[param];
			}else{
				for(var p in cache){
					if(cache[p].res===param){
						delete cache[p];
						break;
					}
				}
			}
		}
	},
	/**
	 * 销毁托管的资源
	 * @param {Boolean} [byRefresh] 是否是刷新时的销毁
	 */
	destroyManaged:function(byRefresh){
		var me=this;
		var cache=me.$resCache;
		//
		if(cache){
			for(var p in cache){
				var o=cache[p];
				var processed=false;
				var res=o.res;
				if(Magix.isNumber(res)){//数字，有可能是定时器
					WIN.clearTimeout(res);
					WIN.clearInterval(res);
					processed=true;
				}else if(res){
					for(var i=0;i<DestroyManagedTryList.length;i++){
						if(Magix.isFunction(res[DestroyManagedTryList[i]])){
							safeExec(res[DestroyManagedTryList[i]],[],res);
							processed=true;
							//不进行break,比如有时候可能存在abort 和  destroy
						}
					}
				}
				me.trigger('destroyResource',{
					resource:res,
					processed:processed
				});
				if(byRefresh&&!o.hasKey){//如果是刷新且托管时没有给key值，则表示这是一个不会在其它方法内共享托管的资源，view刷新时可以删除掉
					delete cache[p];
				}
			}
			if(!byRefresh){//如果不是刷新，则是view的销毁
				me.unbind('destroyResource');
				delete me.$resCache;
			}
		}
	},
	/**
	 * 包装托管的函数
	 * @param {Function} fn 托管的函数
	 * @return {Function}   包装后的函数
	 */
	wrapManagedFunction:function(fn){
		var me=this;
		var sign=me.sign;
		return function(){
			//
			if(me.sign==sign){
				safeExec(fn,arguments,me);
			}
		}
	},
	/**
	 * 当您采用setViewHTML方法异步更新html时，通知view做好异步更新的准备，<b>注意:该方法最好和manage，setViewHTML一起使用。当您采用其它方式异步更新整个view的html时，仍需调用该方法</b>，建议对所有的异步更新回调使用manage方法托管，对更新整个view html前，调用beginAsyncUpdate进行更新通知
	 * @example
	 * // 什么是异步更新html？
	 * render:function(){
	 * 		var _self=this;
	 * 		var m=new Model({uri:'user:list'});
	 * 		m.load({
	 * 			success:_self.manage(function(data){
	 * 				var html=Mu.to_html(_self.template,data);
	 * 				_self.setViewHTML(html);
	 * 			}),
	 * 			error:_self.manage(function(msg){
	 * 				_self.setViewHTML(msg);
	 * 			})
	 * 		})
	 * }
	 *
	 * //如上所示，当调用render方法时，render方法内部使用model异步获取数据后才完成html的更新则这个render就是采用异步更新html的
	 *
	 * //异步更新带来的问题：
	 * //view对象监听地址栏中的某个参数，当这个参数发生变化时，view调用render方法进行刷新，因为是异步的，所以并不能立即更新界面，
	 * //当监控的这个参数连续变化时，view会多次调用render方法进行刷新，由于异步，你并不能保证最后刷新时发出的异步请求最后返回，
	 * //有可能先发出的请求后返回，这样就会出现界面与url并不符合的情况，比如tabs的切换和tabPanel的更新，连续点击tab1 tab2 tab3 
	 * //会引起tabPanel这个view刷新，但是异步返回有可能3先回来2最后回来，会导致明明选中的是tab3，却显示着tab2的内容
	 * //所以要么你自已在回调中做判断，要么把上面的示例改写成下面这样的：
	 * 	render:function(){
	 * 		var _self=this;
	 * 		_self.beginAsyncUpdate();//开始异步更新
	 * 		var m=new Model({uri:'user:list'});
	 * 		m.load({
	 * 			success:_self.manage(function(data){
	 * 				var html=Mu.to_html(_self.template,data);
	 * 				_self.setViewHTML(html);
	 * 			}),
	 * 			error:_self.manage(function(msg){
	 * 				_self.setViewHTML(msg);
	 * 			})
	 * 		});
	 * 		_self.endAsyncUpdate();//结束异步更新
	 * }
	 * //其中endAsyncUpdate是备用的，把你的异步更新的代码放begin end之间即可
	 * //当然如果在每个异步更新的都需要这样写的话来带来差劲的编码体验，所以View会对render,renderUI,updateUI三个方法自动进行异步更新包装
	 * //您在使用这三个方法异步更新html时无须调用beginAsyncUpdate和endAsyncUpdate方法
	 * //如果除了这三个方法外你还要添加其它的异步更新方法，可调用View静态方法View.registerAsyncUpdateName来注册自已的方法
	 * //请优先考虑使用render renderUI updateUI 这三个方法来实现view的html更新，其中render方法magix会自动调用，您就考虑后2个方法吧
	 * //比如这样：
	 *
	 * renderUI:function(){//当方法名为 render renderUI updateUI时您不需要考虑异步更新带来的问题
	 * 		var _self=this;
	 * 		setTimeout(this.manage(function(){
	 * 			_self.setViewHTML(_self.template);
	 * 		}),5000);
	 * },
	 *
	 * receiveMessage:function(e){
	 * 		if(e.action=='render'){
	 * 			this.renderUI();
	 * 		}
	 * }
	 *
	 * //当您需要自定义异步更新方法时，可以这样：
	 * KISSY.add("app/views/list",function(S,MxView){
	 * 		var ListView=MxView.extend({
	 * 			updateHTMLByXHR:function(){
	 * 				var _self=this;
	 * 				S.io({
	 * 					success:_self.manage(function(html){
	 * 						//TODO
	 * 						_self.setViewHTML(html);
	 * 					})
	 * 				});
	 * 			},
	 * 			receiveMessage:function(e){
	 * 				if(e.action=='update'){
	 * 					this.updateHTMLByXHR();
	 * 				}
	 * 			}
	 * 		});
	 *   	ListView.registerAsyncUpdateName('updateHTMLByXHR');//注册异步更新html的方法名
	 * 		return ListView;
	 * },{
	 * 		requires:["magix/view"]
	 * })
	 * //当您不想托管回调方法，又想消除异步更新带来的隐患时，可以这样：
	 *
	 * updateHTML:function(){
	 * 		var _self=this;
	 * 		var begin=_self.beginAsyncUpdate();//记录异步更新标识
	 * 		S.io({
	 * 			success:function(html){
	 * 				//if(_self.exist){//不托管方法时，您需要自已判断view有没有销毁(使用异步更新标识时，不需要判断exist)
	 * 					var end=_self.endAsyncUpdate();//结束异步更新
	 * 					if(begin==end){//开始和结束时的标识一样，表示view没有更新过
	 * 						_self.setViewHTML(html);
	 * 					}
	 * 				//}
	 * 			}
	 * 		});
	 * }
	 *
	 * //顺带说一下signature
	 * //并不是所有的异步更新都需要托管，考虑这样的情况：
	 *
	 * render:function(){
	 * 		ModelFactory.fetchAll({
	 * 			type:'User_List',
	 * 			cacheKey:'User_List'
	 * 		},function(m){
	 * 			//render
	 * 		});
	 * },
	 * //...
	 * click:{
	 * 		addUser:function(e){
	 * 			var m=ModelFactory.getIf('User_List');
	 * 		 	var userList=m.get("userList");
	 * 		 	m.beginTransaction();
	 * 		 	userList.push({
	 * 		 		id:'xinglie',
	 * 		 		name:'xl'
	 * 		 	});
	 *
	 * 			m.save({
	 * 				success:function(){//该回调不太适合托管
	 * 					m.endTransaction();
	 * 					Helper.tipMsg('添加成功')
	 * 				},
	 * 				error:function(msg){//该方法同样不适合托管，当数据保存失败时，需要回滚数据，而如果此时view有刷新或销毁，会导致该方法不被调用，无法达到数据的回滚
	 * 					m.rollbackTransaction();
	 * 					Helper.tipMsg('添加失败')
	 * 				}
	 * 			})
	 * 		
	 * 		}
	 * }
	 *
	 * //以上click中的方法这样写较合适：
	 *
	 * click:{
	 * 		addUser:function(e){
	 * 			var m=ModelFactory.getIf('User_List');
	 * 		 	var userList=m.get("userList");
	 * 		 	m.beginTransaction();
	 * 		 	userList.push({
	 * 		 		id:'xinglie',
	 * 		 		name:'xl'
	 * 		 	});
	 *
	 *			var sign=e.view.signature();//获取签名
	 * 
	 * 			m.save({
	 * 				success:function(){//该回调不太适合托管
	 * 					m.endTransaction();
	 * 					if(sign==e.view.signature()){//相等时表示view即没刷新也没销毁，此时才提示
	 * 						Helper.tipMsg('添加成功')
	 * 					}		
	 * 				},
	 * 				error:function(msg){//该方法同样不适合托管，当数据保存失败时，需要回滚数据，而如果此时view有刷新或销毁，会导致该方法不被调用，无法达到数据的回滚
	 * 					m.rollbackTransaction();
	 * 					if(sign==e.view.signature()){//view即没刷新也没销毁
	 * 						Helper.tipMsg('添加失败')
	 * 					}
	 * 				}
	 * 			})
	 * 		
	 * 		}
	 * }
	 *
	 * //如果您无法识别哪些需要托管，哪些需要签名，统一使用托管方法就好了
	 */
	beginAsyncUpdate:function(){
		return this.sign++;//更新sign，@see构造函数内的注解
	},
	/**
	 * 获取view在当前状态下的签名，view在刷新或销毁时，均会更新签名。(通过签名可识别view有没有搞过什么动作)
	 * @see View#beginAsyncUpdate
	 */
	signature:function(){
		return this.sign;
	},
	/**
	 * 通知view结束异步更新html
	 * @see View#beginAsyncUpdate
	 */
	endAsyncUpdate:function(){
		return this.sign;
	},
	/**
	 * 挂起，对于初始化时，需要访问外部资源（vframe）等，需要等待外部执行完才可以访问
	 */
	suspend:function(){
		this.iC++;
	},
	/**
	 * 恢复并执行挂起的操作
	 */
	resume:function(){
		var me=this;
		if(me.iC>0){
			me.iC--;
		}
		if(!me.iC){
			var list=[].slice.call(me.iQ);
			me.iQ=[];
			while(list.length){
				var o=list.shift();
				me.idle.apply(me,o);
			}
		}
	}
	/**
	 * 当view调用setViewHTML刷新前触发
	 * @name View#prerender
	 * @event
	 * @param {Object} e
	 */
	
	/**
	 * 当view首次调用render完成渲染后触发
	 * @name View#created 
	 * @event
	 * @param {Object} e view首次调用render完成界面的创建后触发
	 */

	/**
	 * 每次调用setViewHTML更新view内容前触发，触发完该事件后即删除监听列表，如果您不需要删除监听列表，请考虑使用prerender事件，为什么设计refresh?见示例
	 * @name View#refresh
	 * @event
	 * @param {Object} e view刷新前触发
	 * @example
	 * render:function(){
	 * 		var fn=function(){};
	 * 		S.one(document).on('click',fn);
	 *      this.bind('refresh',function(){//当使用refresh事件时，您不需要考虑移除监听
	 *      	S.one(document).detach('click',fn);
	 *      });
	 *
	 * 		//如果您使用prerender事件
	 *
	 * 		this.bind('prerender',function(){
	 * 			this.unbind('prerender',arguments.callee);//您需要移除监听，要不然会越积累越多
	 * 		 	S.one(document).detach('click',fn);
	 * 		})
	 * 		
	 * }
	 */
 
	/**
	 * 每次调用setViewHTML更新view内容完成后触发
	 * @name View#rendered 
	 * @event
	 * @param {Object} e view每次调用setViewHTML完成后触发，当hasTemplate属性为false时，并不会触发该事 件，但会触发created首次完成创建界面的事件
	 */
	
	/**
	 * view销毁时触发
	 * @name View#destroy
	 * @event
	 * @param {Object} e
	 */
	
	/**
	 * view销毁托管资源时发生
	 * @name View#destroyResource
	 * @event
	 * @param {Object} e
	 * @param {Object} e.resource 托管的资源
	 * @param {Boolean} e.processed 表示view是否对这个资源做过销毁处理，目前view仅对带 abort destroy dispose方法的资源进行自动处理，其它资源需要您响应该事件自已处理
	 */
	
	/**
	 * view的所有子view包括孙view创建完成后触发，常用于要在某个view中统一绑定事件或统一做字段校验，而这个view是由许多子view组成的，通过监听该事件可知道子view什么时间创建完成
	 * @name View#childrenCreated
	 * @event
	 * @param {Object} e
	 * @example
	 * init:function(){
	 * 		this.bind('childrenCreated',function(){
	 * 			//
	 * 		})
	 * }
	 */
});
	Magix.mix(View,IView,{prototype:true});
	Magix.mix(View.prototype,IView.prototype);
	return View;
},{
	requires:["magix/impl/view","magix/magix","magix/event"]
});/**
 * @fileOverview VOM
 * @author 行列
 * @version 1.0
 */
KISSY.add("magix/vom",function(S,Vframe,Magix){
	var D=document;

/**
 * VOM对象
 * @name VOM
 * @namespace
 */
var VOM={
	/**
	 * @lends VOM
	 */
	iC:0,
	iQ:[],
	/**
	 * 根vframe对象
	 * @type {Vframe}
	 */
	rootVframe:null,
	/**
	 * 注册的vframes集合
	 * @type {Object}
	 */
	vframes:{},
	/**
	 * 根vframe的id
	 * @default magix_vf_root
	 * @type {String}
	 */
	rootVframeId:'magix_vf_root',
	/**
	 * 注册vframe对象
	 * @param {Vframe} vf Vframe对象
	 */
	registerVframe:function(vf){
		var me=this;
		me.vframes[vf.id]=vf;
	},
	/**
	 * 根据vframe的id获取vframe对象
	 * @param {String} id vframe的id
	 * @return {Vframe} vframe对象
	 */
	getVframe:function(id){
		return this.vframes[id];
	},
	/**
	 * 删除已注册的vframe对象
	 * @param {Vframe|String} vf vframe对象或对象的id
	 */
	unregisterVframe:function(vf){
		var id=Magix.isString(vf)?vf:vf.id;
		delete this.vframes[id];
	},
	/**
	 * 构建根vframe对象
	 */
	buildRootVframe:function(){
		var me=this;
		if(!me.rootVframe){
			var rootVframeNode=D.getElementById(me.rootVframeId);
			if(!rootVframeNode){//当发现不存在的节点时，由Vframe对象负责创建
				Vframe.createVframeNode(me.rootVframeId,D.body.firstChild);
			}
			me.rootVframe=Vframe.createVframe(me.rootVframeId,{owner:me});
			me.registerVframe(me.rootVframe);
		}
	},
	/**
	 * 重新渲染根vframe
	 * @param {Object} e Router.locationChanged事件对象
	 * @param {Object} e.location window.location.href解析出来的对象
	 * @param {Object} e.changed 包含有哪些变化的对象
	 */
	remountRootVframe:function(e){
		//
		var me=this;
		me.$location=e.location;
		me.buildRootVframe();
		//
		me.rootVframe.mountView(e.location.viewPath);
	},
	/**
	 * 向vframe通知地址栏发生变化
	 * @param {Object} e 事件对象
	 * @param {Object} e.location window.location.href解析出来的对象
	 * @param {Object} e.changed 包含有哪些变化的对象
	 */
	notifyLocationChange:function(e){
		var me=this;
		me.$location=e.location;
		if(me.rootVframe){
			me.rootVframe.notifyLocationChange(e);
		}
	},
	/**
	 * 当VOM处于闲置状态时回调传入的fn，当VOM忙碌时则把fn添加到等待队列
	 * @param {Function} fn 闲置时的回调函数
	 * @param {Array} [args] 参数
	 * @param {Object} [context] fn内this指向
	 */
	idle:function(fn,args,context){
		var me=this;
		//
		if(me.iC){
			me.iQ.push([fn,args,context]);
		}else{
			Magix.safeExec(fn,args,context);
		}
	},
	/**
	 * 挂起VOM，等待外部的操作完成
	 */
	suspend:function(){
		var me=this;
		me.iC++;
	},
	/**
	 * 恢复挂起的VOM
	 */
	resume:function(){
		var me=this;
		if(me.iC>0){
			me.iC--;
		}
		if(!me.iC){
			var list=me.iQ;
			if(list.length){
				var tasks=[].slice.call(list);
				me.iQ=[];
				while(tasks.length){
					var o=tasks.shift();
					me.idle.apply(me,o);
				}
			}
		}
	}
}
	return VOM;
},{
	requires:["magix/vframe","magix/magix"]
});/**
 * @fileOverview Model
 * @version 1.0
 * @author 行列
 */
KISSY.add("mxext/model",function(S,Magix){
    /**
     * Model类
     * @name Model
     * @namespace
     * @class
     * @constructor
     * @param {Object} ops 初始化Model时传递的其它参数对象
     * @property {String} uri 与后台接口对应的前端url key
     * @property {String} id model的唯一标识
     * @example
     * 项目中对Model的引用及配置：
     * KISSY.add("app/base/model",function(S,Model,io){
            return Model.extend(
                urlMap:{
                    'modules':{
                        'get':'/modules.jsp?action=get',
                        'set':'/modules.jsp?action=set'
                    }
                },
                parse:function(resp){
                    return resp;//可对返回的结果在这地方进行简单的处理
                },
                sync:function(model,ops){
                    var url=model.url();
                    var isJSONP=model.get('isJSONP');
                    return io({
                        url:url,
                        success:function(resp){
                            ops.success(resp);
                        }
                    });
                }
            });
        },{
            requires:["mxext/model","ajax"]
        });

        在view中的具体使用：

        render:function(){
            var m=new Model({
                uri:'modules:get'
            });
            m.load({
                success:function(data){
                    //TODO
                },
                error:function(msg){
                    //TODO
                }
            })
        }
     */
	var Model=function(ops){
        if(ops){
            this.set(ops);
        }
        this.id=S.guid('m');
        this.locker=false;
        this.hasLocker=false;
	};
    var ex=function(props,ctor){
        var fn=function(){
            fn.superclass.constructor.apply(this,arguments);
            if(ctor){
                Magix.safeExec(ctor,[],this);
            }
        }
        Magix.mix(fn,this,{prototype:true});
        return S.extend(fn,this,props);
    };
    Magix.mix(Model,{
        /**
         * @lends Model
         */
        /**
         * GET枚举
         * @type {String}
         */
        GET:'GET',
        /**
         * POST枚举
         * @type {String}
         */
        POST:'POST',
        /**
         * 继承
         * @function
         * @param {Object} props 方法对象
         * @param {Function} ctor 继承类的构造方法
         */
        extend:ex
    });


	Magix.mix(Model.prototype,{
        /**
         * @lends Model#
         */
        /**
         * url映射对象
         * @type {Object}
         */
        urlMap:{

        },
        /**
         * Model调用save或load方法后，与服务器同步的方法，供应用开发人员覆盖
         * @function
         * @param {Model} model model对象
         * @param {Object} ops 包含success error的参数信息对象
         * @return {XHR} 最好返回异步请求的对象
         */
        sync:Magix.noop,
        /**
         * 处理Model.sync成功后返回的数据
         * @function
         * @param {Object|String} resp 返回的数据
         * @return {Object}
         */
        parse:Magix.noop,
        /**
         * 获取通过setPostParams放入的参数
         * @return {String}
         */
        getPostParams:function () {
            return this.getParams("POST");
        },
        /**
         * 获取参数
         * @param {String} [key] 参数分组的key[Model.GET,Model.POST]，默认为Model.GET
         * @return {String}
         */
        getParams:function (key) {
            var me=this;
            if(!key){
                key=Model.GET;
            }else{
                key=key.toUpperCase();
            }
            var k='$'+key;
            var params=me[k];
            var arr=[];
            var v;
            if (params) {
                for (var p in params) {
                    v = params[p];
                    if (S.isArray(v)) {
                        for (var i = 0; i < v.length; i++) {
                            arr.push(p + '=' + encodeURIComponent(v[i]));
                        }
                    } else {
                        arr.push(p + '=' + encodeURIComponent(v));
                    }
                }
            }
            return arr.join('&');
        },
        /**
         * 设置get参数，只有未设置过的参数才进行设置
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         */
        setParamsIf:function (obj1, obj2) {
            this.setParams(obj1, obj2, Model.GET,true);
        },
        /**
         * 设置参数
         * @param {String}   key      参数分组的key
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         * @param {Boolean}   ignoreIfExist   如果存在同名的参数则不覆盖，忽略掉这次传递的参数
         * @param {Function} callback 对每一项参数设置时的回调
         */
        setParams:function (obj1,obj2,key,ignoreIfExist) {
            if(!key){
                key=Model.GET;
            }else{
                key=key.toUpperCase();
            }
            var me=this;
            if(!me.$keysCache)me.$keysCache={};
            me.$keysCache[key]=true;

            var k = '$' + key;
            if (!me[k])me[k] = {};
            if (S.isObject(obj1)) {
                for (var p in obj1) {
                    if (!ignoreIfExist || !me[k][p]) {
                        me[k][p] = obj1[p];
                    }
                }
            } else if(obj1&&obj2){
                if (!ignoreIfExist || !me[k][obj1]) {
                    me[k][obj1] = obj2;
                }
            }
        },
        /**
         * 设置post参数
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         */
        setPostParams:function (obj1, obj2) {
            var me = this;
            me.setParams(obj1, obj2,Model.POST);
        },
        /**
         * 设置post参数，只有未设置过的参数才进行设置
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         */
        setPostParamsIf:function(obj1,obj2){
        	var me=this;
        	me.setParams(obj1,obj2,Model.POST,true);
        },
        /**
         * 重置缓存的参数对象，对于同一个model反复使用前，最好能reset一下，防止把上次请求的参数也带上
         */
        reset:function () {
            var me=this;
            var keysCache=me.$keysCache;
            if(keysCache){
                for(var p in keysCache){
                    if(Magix.hasProp(keysCache,p)){
                        delete me['$'+p];
                    }
                }
                delete me.$keysCache;
            }
            var keys=me.$keys;
            var attrs=me.$attrs;
            if(keys){
                for(var i=0;i<keys.length;i++){
                    delete attrs[keys[i]];
                }
                delete me.$keys;
            }
        },
        /**
         * 获取model对象请求时的后台地址
         * @return {String}
         */
        url:function () {
            var self = this,
                uri = self.get('uri'),
                uris;
            if (uri) {
                uris = uri.split(':');
                var maps=self.urlMap;
                if(maps){
                    for (var i = 0, parent = maps; i < uris.length; i++) {
                        parent = parent[uris[i]];
                        if (parent === undefined) {
                            break;
                        } else if (i == uris.length - 1) {
                            uri=parent;
                        }
                    }
                }
            }else{
                
                throw new Error('model not set uri');
            }
            return uri;
        },
        /**
         * 获取属性
         * @param {String} key key
         * @return {Object}
         */
        get:function(key){
            var me=this;
            var attrs=me.$attrs;
            if(attrs){
                return attrs[key];
            }
            return null;
        },
        /**
         * 设置属性
         * @param {String|Object} key 属性对象或属性key
         * @param {Object} [val] 属性值
         */
        set:function(key,val,saveKeyList){
            var me=this;
            if(!me.$attrs)me.$attrs={};
            if(saveKeyList&&!me.$keys){
                me.$keys=[];
            }
            if(S.isObject(key)){
                for(var p in key){
                    if(saveKeyList){
                        me.$keys.push(p);
                    }
                    me.$attrs[p]=key[p];
                }
            }else if(key){
                if(saveKeyList){
                    me.$keys.push(key);
                }
                me.$attrs[key]=val;
            }
        },
        /**
         * 加载model数据
         * @param {Object} ops 请求选项
         */
        load:function(ops){
            this.request(ops);
        },
        /**
         * 保存model数据
         * @param {Object} ops 请求选项
         */
        save:function(ops){
            this.request(ops);
        },
        /**
         * 向服务器请求，加载或保存数据
         * @param {Object} ops 请求选项
         */
        request:function(ops){
            if(!ops)ops={};
            var success=ops.success;
            var error=ops.error;
            var me=this;
            if(!me.hasLocker||!me.locker){
                me.$abort=false;
                me.locker=me.hasLocker;
                ops.success=function(resp){
                    me.locker=false;
                    if(!me.$abort){
                        if(resp){
                            var val=me.parse(resp);
                            if(val){
                                if(S.isArray(val)){
                                    val={
                                        list:val
                                    };
                                }
                                me.set(val,null,true);
                            }
                        }
                        if(success){
                            success.apply(this,arguments);
                        }
                    }
                };
                ops.error=function(){
                    me.locker=false;
                    if(!me.$abort){
                        if(error)error.apply(this,arguments);
                    }
                };
                me.$trans=me.sync(me,ops);
            }
        },
        /**
         * 中止请求
         */
        abort:function(){
            var me=this;
            if(me.$trans&&me.$trans.abort){
                me.$trans.abort();
            }
            delete me.$trans;
            me.$abort=true;
        },
        /**
         * 开始事务
         * @example
         * //...
         * var userList=m.get('userList');//从model中取出userList数据
         * m.beginTransaction();//开始更改的事务
         * userList.push({userId:'123',userName:'xinglie'});//添加一个新用户
         * m.save({
         *     //...
         *     success:function(){
         *           m.endTransaction();//成功后通知model结束事务  
         *     },
         *     error:function(){
         *         m.rollbackTransaction();//出错，回滚到原始数据状态
         *     }
         * });
         * //应用场景：
         * //前端获取用户列表，添加，删除或修改用户后
         * //把新的数据提交到数据库，因model是数据的载体
         * //可能会直接在model原有的数据上修改，提交修改后的数据
         * //如果前端提交到服务器，发生失败时，需要把
         * //model中的数据还原到修改前的状态(当然也可以再次提交)
         * //
         * //注意：
         * //可能添加，删除不太容易应用这个方法，修改没问题
         * //
         */
        beginTransaction:function(){
            var me=this;
            me.$bakAttrs=S.clone(me.$attrs);
        },
        /**
         * 回滚对model数据做的更改
         */
        rollbackTransaction:function(){
            var me=this;
            var bakAttrs=me.$bakAttrs;
            if(bakAttrs){
                me.$attrs=bakAttrs;
                delete me.$bakAttrs;
            }
        },
        /**
         * 结束事务
         */
        endTransaction:function(){
            delete this.$bakAttrs;
        },
        /**
         * 给请求加锁，上个请求未完成时，不发起新的请求
         * @param {Boolean} locker 是否加锁
         */
        lock:function(locker){
            this.hasLocker=!!locker;
        }
	});
	return Model;
},{
    requires:["magix/magix"]
});/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.0
 **/
KISSY.add("mxext/modelfactory",function(S,Magix){
	/**
	 * 工厂类，可方便的对Model进行缓存和更新
	 * @name ModelFactory
	 * @class
	 * @namespace
	 * @param {Model} modelClass Model类
	 */
	var Factory=function(modelClass){
		var me=this;
		me.$modelClass=modelClass;
	};
	var WrapRequest=function(request){
		if(request._wraped_)return request;
		var req=function(ops){
			var bakSucc=ops.success;
			var model=this;
			var updateIdent=model.get('updateIdent');
			if(updateIdent){//有更新
				ops.success=function(){
					
					model.set('updateIdent',false);
					if(model._after){
						Magix.safeExec(model._after,model);
					}
					if(bakSucc){
						bakSucc.apply(ops);
					}
				}
				request.call(model,ops);
			}else{
				if(bakSucc){
					bakSucc.apply(ops);
				}
			}
		}
		req._wraped_=true;
		return req;
	};
	Magix.mix(Factory,{
		/**
		 * @lends ModelFactory
		 */
		/**
		 * Model类缓存对象
		 * @type {Object}
		 */
		mClsCache:{},
		/**
		 * 创建Model类工厂对象
		 * @param {String} key        标识key
		 * @param {Model} modelClass Model类
		 */
		create:function(key,modelClass){
			var me=this;
			if(!modelClass){
				throw new Error('Factory.create modelClass ungiven');
			}
			var cache=me.mClsCache;
			if(!key)key=S.guid();
			if(!cache[key]){
				cache[key]=new Factory(modelClass);
			}
			return cache[key];
		}
	});
	var FetchFlags={
		ALL:1,
		ANY:2,
		ONE:4
	};
	Magix.mix(Factory.prototype,{
		/**
		 * @lends ModelFactory#
		 */
		/**
		 * 注册APP中用到的model
		 * @param {Object|Array} models 模块描述信息
		 * @param {String} models.type app中model的唯一标识
		 * @param {Object} models.ops 传递的参数信息，如{uri:'test',isJSONP:true,updateIdent:true}
		 * @param {Object} models.gets 发起请求时，默认的get参数对象
		 * @param {Object} models.posts 发起请求时，默认的post参数对象
		 * @param {Function} models.before model在发起请求前的回调
		 * @param {Function} models.after model在发起请求，并且通过Model.sync调用success后的回调
		 * @example
		 * KISSY.add("app/base/mfactory",function(S,MFctory,Model){
				var MF=MFctory.create('test/mf',Model);
				MF.registerModels([
					{
						type:'Home_List',
						ops:{
							uri:'test'
						},
						gets:{
							a:'12'
						},
						before:function(m){
							
						},
						after:function(m){
							
						}
					},
					{
						type:'Home_List1',
						ops:{
							uri:'test'
						},
						before:function(m){
							
						},
						after:function(m){
							
						}
					}
				]);
				return MF;
			},{
				requires:["mxext/modelfactory","app/base/model"]
			});

			//使用

			KISSY.use('app/base/mfactory',function(S,MF){
				MF.fetchAll([{
					type:MF.Home_List,cacheKey:'aaa',gets:{e:'f'},
					type:MF.Home_List1,gets:{a:'b'}
				}],function(m1,m2){
	
				},function(msg){
	
				});
			});
		 */
		registerModels:function(models){
			/*
				type:'',
				ops:{
					uri:'',
					isJSONP:'',
					updateIdent:false
				},
				gets:'',
				posts:'',
				before:function(m){
	
				},
				after:function(m){
					
				}
			 */
			var me=this;
			if(!Magix.isArray(models)){
				models=[models];
			}
			for(var i=0,model;i<models.length;i++){
				model=models[i];
				if(!model.type){
					throw new Error('model must own a type attribute');
				}
				me[model.type]=model;
			}
		},
		/**
		 * 获取models，该用缓存的用缓存，该发起请求的请求
		 * @see ModelFactory#registerModels
		 * @param {Object|Array} models 获取models时的描述信息，如:{type:F.Home,cacheKey:'key',gets:{a:'12'},posts:{b:2}}
		 * @param {Function} succ   成功时的回调
		 * @param {Function} fail   失败时的回调
		 * @param {Integer} flag   获取哪种类型的models
		 * @return {Object} 返回一个带abort方法的对象，用于取消所有请求的model
		 */
		fetchModels:function(models,succ,fail,flag){
			var me=this;
			if(!me.$modelsCache)me.$modelsCache={};
			if(!me.$modelsCacheKeys)me.$modelsCacheKeys={};
			var modelsCache=me.$modelsCache;
			var modelsCacheKeys=me.$modelsCacheKeys;

			if(!Magix.isArray(models)){
				models=[models];
			}
			var total=models.length;
			var current=0;
			var failMsg;

			var doneArr=[];
			var abortArr=[];
			var hasOneSuccess;

			var doneFn=function(idx,isFail,model,args){
				current++;
				if(isFail){
					failMsg=args||'fetch data error';
				}else{
					hasOneSuccess=true;
					model.set('updateIdent',false);//成功后标识model不需要更新，防止需要缓存的model下次使用时发起请求
					doneArr[idx]=model;
					var cacheKey=model._cacheKey;
					if(cacheKey&&!Magix.hasProp(modelsCache,cacheKey)){//需要缓存
						modelsCache[model._cacheKey]=model;
						if(model._after){//有after
							Magix.safeExec(model._after,model);
						}
					}
					if(flag==FetchFlags.ONE){//如果是其中一个成功，则每次成功回调一次
						succ(model);
					}
				}
				var cacheKey=model._cacheKey;
				if(cacheKey&&Magix.hasProp(modelsCacheKeys,cacheKey)){
					var fns=modelsCacheKeys[cacheKey];
					delete modelsCacheKeys[cacheKey];
					//
					Magix.safeExec(fns,[isFail,model,args],model);
					//
				}
				if(flag!=FetchFlags.ONE){
					//
					if(current>=total){
						if(flag==FetchFlags.ANY){//任意一个成功
							if(hasOneSuccess){
								if(succ)succ.apply(me,doneArr);
							}else{
								if(fail)fail(failMsg);
							}
						}else{//所有的都要成功
							if(!failMsg){
								if(succ)succ.apply(me,doneArr);
							}else{
								if(fail)fail(failMsg);
							}
						}
					}
				}
			};
			//
			var Slice=Array.prototype.slice;
			var wrapDone=function(fn,context){
				var a = Slice.call(arguments, 2);
				return function(){
					return fn.apply(context,a.concat(Slice.call(arguments)));
				}
			};
			for(var i=0,model;i<models.length;i++){
				model=models[i];

				var cacheKey=model.cacheKey;
				var modelEntity;

				if(cacheKey&&Magix.hasProp(modelsCacheKeys,cacheKey)){
					modelsCacheKeys[cacheKey].push(wrapDone(doneFn,me,i));
				}else{
					modelEntity=me.create(model,true);
					var updateIdent=modelEntity.get('updateIdent');//是否需要更新
					if(updateIdent){
						abortArr.push(modelEntity);
						if(cacheKey){
							modelsCacheKeys[cacheKey]=[];
						}
						modelEntity.request({
							success:wrapDone(doneFn,modelEntity,i,false,modelEntity),
							error:wrapDone(doneFn,modelEntity,i,true,modelEntity)
						});
					}else{
						doneFn(i,false,modelEntity);
					}
				}
			}
			return {
				abort:function(){
					for(var i=0,m;i<abortArr.length;i++){
						m=abortArr[i];
						var cacheKey=m._cacheKey;
						if(cacheKey&&Magix.hasProp(modelsCacheKeys,cacheKey)){
							var fns=modelsCacheKeys[cacheKey];
							delete modelsCacheKeys[cacheKey];
							Magix.safeExec(fns,[true,m,'abort'],m);
						}
						m.abort();
					}
				}
			}
		},
		/**
		 * 获取models，所有成功才回调succ，任意一个失败最终会回调fail
		 * @param {Object|Array} models 获取models时的描述信息，如:{type:F.Home,cacheKey:'key',gets:{a:'12'},posts:{b:2}}
		 * @param {Function} succ   成功时的回调
		 * @param {Function} fail   失败时的回调
		 * @return {Array} 返回一个带abort方法的对象，用于取消所有请求的model
		 */
		fetchAll:function(models,succ,fail){
			/*
				[{type:F.ASide,cacheKey:'',gets:{},posts:{}}]
			 */
			return this.fetchModels(models,succ,fail,FetchFlags.ALL);
		},
		/**
		 * 获取models，其中任意一个成功最终回调succ，全部失败才回调fail
		 * @param {Object|Array} models 获取models时的描述信息，如:{type:F.Home,cacheKey:'key',gets:{a:'12'},posts:{b:2}}
		 * @param {Function} succ   成功时的回调
		 * @param {Function} fail   失败时的回调
		 * @return {Array} 返回一个带abort方法的对象，用于取消所有请求的model
		 */
		fetchAny:function(models,succ,fail){
			return this.fetchModels(models,succ,fail,FetchFlags.ANY);
		},
		/**
		 * 获取models，其中任意一个成功均立即回调，回调会被调用多次
		 * @param {Object|Array} models 获取models时的描述信息，如:{type:F.Home,cacheKey:'key',gets:{a:'12'},posts:{b:2}}
		 * @param {Function} callback   成功时的回调
		 * @return {Array} 返回一个带abort方法的对象，用于取消所有请求的model
		 */
		fetchOne:function(models,callback){
			return this.fetchModels(models,callback,Magix.noop,FetchFlags.ONE);
		},
		/**
		 * 尝试获取缓存的model
		 * @param {String} cacheKey 缓存时的key
		 * @return {Object} null或缓存的model
		 */
		getIf:function(cacheKey){
			var me=this;
			var modelsCache=me.$modelsCache;
			if(modelsCache&&Magix.hasProp(modelsCache,cacheKey)){
				return modelsCache[cacheKey];
			}
			return null;
		},
		/**
		 * 设置缓存的model需要更新
		 * @param {String} cacheKey 缓存时的key
		 */
		setUpdateIdent:function(cacheKey){
			var me=this;
			var model=me.getIf(cacheKey);
			if(model){
				model.set('updateIdent',true);
			}
		},
		/**
		 * 创建model对象
		 * @param {Object} model            model描述信息
		 * @param {Boolean} doNotWrapRequest 是否不对request进行包装，默认会对model的request进行一次包装，以完成后续的状态更新
		 * @return {Model} model对象
		 */
		create:function(model,doNotWrapRequest){
			if(!model.type){
				throw new Error('model must own a "type" attribute');
			}
			var me=this;
			var metas=model.type;
			var cacheKey=model.cacheKey||metas.cacheKey;
			var modelEntity;
			
			if(!me.$modelsCache)me.$modelsCache={};
			var modelsCache=me.$modelsCache;

			if(cacheKey&&Magix.hasProp(modelsCache,cacheKey)){//缓存
				
				modelEntity=modelsCache[cacheKey];

				var updateIdent=modelEntity.get('updateIdent');
				if(updateIdent){//当有更新时，从缓存中删除，防止多次获取该缓存对象导致数据错误
					delete modelsCache[cacheKey];
				}
			}else{
				
				modelEntity=new me.$modelClass(metas.ops);
				modelEntity._after=metas.after;
				modelEntity._cacheKey=cacheKey;
				modelEntity.set('updateIdent',true);
			}
			var updateIdent=modelEntity.get('updateIdent');//是否需要更新
			if(updateIdent){
				modelEntity.reset();
				
				modelEntity.set(model.ops);
				//默认设置的
				modelEntity.setParams(metas.gets);
				modelEntity.setPostParams(metas.posts);

				//临时传递的
				modelEntity.setParams(model.gets);
				modelEntity.setPostParams(model.posts);
				
				if(Magix.isFunction(metas.before)){
					Magix.safeExec(metas.before,modelEntity,metas);
				}
			}
			if(!doNotWrapRequest){
				modelEntity.request=WrapRequest(modelEntity.request);
			}
			return modelEntity;
		}
	});
	return Factory;
},{
	requires:["magix/magix"]
}); /**
  * Magix扩展的Mustache
  * @name Mu
  * @namespace
  * @requires Mustache
  * @author 李牧
  * @example
  * 支持简单的条件判断 如:
  * <pre>
    {{#list}}
    &nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==P)}}ID:{{id}},status:&lt;b style='color:green'>通过&lt;/b>{{/if(status==P)}}
    &nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==W)}}ID:{{id}},status:等待{{/if(status==W)}}
    &nbsp;&nbsp;&nbsp;&nbsp;{{#if(status==R)}}ID:{{id}},status&lt;b style='color:red'>拒绝&lt;/b>{{/if(status==R)}}
    {{/list}}
    </pre>
    对于数组对象可以通过{{__index__}}访问数组下标
  */
KISSY.add("mxext/mu",function(S,Mustache){
    var notRender=/\s*<script[^>]+type\s*=\s*(['"])\s*text\/tmpl\1[^>]*>([\s\S]*?)<\/script>\s*/gi;
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
            var o = v[i];
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
         * @lends Mu
         */
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
            var notRenders=template.match(notRender);
            if(notRenders){
                template=template.replace(notRender,function(){//防止不必要的解析
                    return '<script type="text/tmpl"></script>';
                });
                addFns(template, data);
                template=Mustache.to_html.apply(this, arguments);
                var idx=0;
                template=template.replace(notRender,function(){
                    return notRenders[idx++];
                });
            }else{
                addFns(template, data);
                template=Mustache.to_html.apply(this, arguments);
            }
            return template;
        }
    };
},{
	requires:["mxext/mustache"]
});


KISSY.add("mxext/mustache", function(S) {

	/*
	 mustache.js — Logic-less templates in JavaScript

	 See http://mustache.github.com/ for more info.
	 */
	 /**
	  * Mustache模板
	  * @name Mustache
	  * @namespace
	  */
	var Mustache = function() {
		/**
		 * @name Renderer
		 * @inner
		 */
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
			/**
			 * @lends Mustache
			 */
			/**
			 * 名称
			 */
			name : "mustache.js",
			/**
			 * 版本
			 */
			version : "0.3.1-dev",

			/**
			 * 把模板根据数据翻译成最终字符串
			 * @param {String} template 模板
			 * @param {Object} view     数据
			 * @return {String}
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
/**
 * @fileOverview 模板
 * @version 1.0
 * @author 行列
 */
KISSY.add("mxext/tmpl",function(S){
	var fnCaches={},
		tmplCaches={},
		stack='_'+new Date().getTime(),
		notRender=/\s*<script[^>]+type\s*=\s*(['"])\s*text\/tmpl\1[^>]*>([\s\S]*?)<\/script>\s*/gi;
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
	/**
	 * 语法为<# #>的模板，<# #>语句 <#= #>输出
	 * @name Tmpl
	 * @namespace
	 * @example
	 * &lt;#for(var i=0;i&lt;10;i++){#&gt;
	 *    &lt;#=i#&gt; &lt;br /&gt;
	 * &lt;#}#&gt;
	 */
	var Tmpl={
		/**
		 * @lends Tmpl
		 */
		/**
		 * 把模板与数据翻译成最终的字符串
		 * @param {String} template 模板字符串
		 * @param {Object} data     数据对象
		 * @return {String}
		 */
		toHTML:function(template,data){
			var notRenders=template.match(notRender);
			if(notRenders){
				template=template.replace(notRender,function(){//防止不必要的解析
					return '<script type="text/tmpl"></script>';
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
	return Tmpl;
});/**
 * @fileOverview view转场动画
 * @author 行列
 * @version 1.0
 */
KISSY.add('mxext/vfanim',function(S,Vf,Magix){
	/**
	 * view转场动画实现
	 * @name VfAnim
	 * @namespace
	 * @example
	 * //当使用此插件时，您应该在Magix.start中增加一项viewChange的配置项来定制动画效果
	 * //如：
	 * 
	 * Magix.start({
	 * 	//...其它配置项
	 * 	viewChangeAnim:true,//是否使用动画
	 * 	viewChange:function(e){
	 *  		var S=KISSY;
	 * 		var offset=S.one(e.oldViewNode).offset();
	 * 		S.one(e.oldViewNode).css({backgroundColor:'#fff'});
	 * 		var distance=offset.top+S.one(e.oldViewNode).height();
	 * 		new S.Anim(e.oldViewNode,{top:-distance,opacity:0.2},1.2,'backIn',e.collectGarbage).run();
	 * 		S.one(e.newViewNode).css({opacity:0});
	 * 		new S.Anim(e.newViewNode,{opacity:1},2).run();
	 * 	}
	 * });
	 * 
	 * //参数说明：
	 * //e.vframeId {Strig} 在哪个vframe内发生的转场动画
	 * //e.oldViewNode {HTMLElement} 原来的view DOM节点
	 * //e.newViewNode {HTMLElement} 新创建的view DOM节点
	 * //e.action {String} 指示是哪种场景改变：viewChange view发生改变 viewRefresh view刷新
	 * //e.collectGarbage {Function} 当您在外部结束动画时，调用该方法清理不需要的垃圾DOM节点，请优先考虑该方法进行垃圾收集
	 *
	 *
	 * //关于转场动画说明：
	 * //转场动画仅适用对于同一个vframe渲染不同view时较安全，因为转场时页面上会同时存在
	 * //这2个view的html内容，而在view内部DOM操作时选择器通常不会意外的选择到其它节点上
	 * //
	 * //对于view的刷新不建议使用动画，因为2个view的html内容一样，DOM选择很容易发生失误
	 * //如果您需要view在刷新时使用动画，最好在代码中DOM选择器都加上id
	 * //类似：
	 *
	 * render:function(){
	 * 		var inputs=S.all('#'+this.id+' input');//加上id限定
	 * }
	 *
	 * 
	 */

	var EMPTY='';
	var mxConfig=Magix.config();
	var D=document;

	var cfgSceneChange=mxConfig.viewChange;
	var cfgSceneChangeIsFn=Magix.isFunction(cfgSceneChange);

	var $=function(id){
		return typeof id=='object'?id:D.getElementById(id);
	};
	return Magix.mix(Vf.prototype,{
		viewChangeUseAnim:function(){
			var me=this;
			
			return mxConfig.viewChangeAnim;
			/*var anim=me.$currentSupportAmin=(Math.random()<0.5)
			return anim;*/
		},
		oldViewDestroy:function(){
			var me=this;
			var ownerNode=$(me.id);
			var oldViewNode=$(me.viewId);
			var view=me.view;
			if(!oldViewNode){
				oldViewNode=D.createElement('div');
				while(ownerNode.firstChild){
					oldViewNode.appendChild(ownerNode.firstChild);
				}
				ownerNode.appendChild(oldViewNode);
			}
			oldViewNode.id=EMPTY;
			var events=view.events;
			if(events){
				for(var p in events){
					if(Magix.hasProp(events,p)){
						S.all('*[mx'+p+']').removeAttr('mx'+p);
					}
				}
			}
			if(!Magix.hasProp(me,'$animCounter')){
				me.$animCounter=0;
			}
			me.$animCounter++;
			me.$oldViewNode=oldViewNode;
		},
		prepareNextView:function(){
			var me=this;
			var ownerNode=$(me.id);
			var div=D.createElement('div');
			div.id=me.viewId;
			ownerNode.insertBefore(div,ownerNode.firstChild);
		},
		newViewCreated:function(isViewChange){
			var me=this;
			var oldViewNode=me.$oldViewNode;
			var newViewNode=$(me.viewId);
			if(cfgSceneChangeIsFn){
				Magix.safeExec(cfgSceneChange,{
					vframeId:me.id,
					action:isViewChange?'viewChange':'viewRefresh',
					oldViewNode:oldViewNode,
					newViewNode:newViewNode,
					collectGarbage:function(){
						me.$animCounter--;
						if(!me.$animCounter){
							delete me.$oldViewNode;
						}
						try{
							oldViewNode.parentNode.removeChild(oldViewNode);
						}catch(e){

						}
					}
				},me);
			}
		}
	});
},{
	requires:["magix/vframe","magix/magix","sizzle"]
});/**
 * @fileOverview 对magix/view的扩展
 * @version 1.0
 * @author 行列
 */
KISSY.add('mxext/view',function(S,View,Router){
	var WIN=window;
	/*
		queryEvents:{
			click:{
				'#id':function(){
					
				},
				'.title':function(){//  S.one('.title').click(); S.one().delegate(); 
					
				}
			},
			mouseover:{
				'#id':function(e){
					
				}
			}
		}
	 */
	/**
	 * @name MxView
	 * @namespace
	 * @requires View
	 * @augments View
	 */
	return View.extend({
		/**
		 * @lends MxView#
		 */
		/**
		 * 根据选择器来注册事件
		 * @type {Object}
		 * @example
		 * queryEvents:{
		 * 		click:{
		 * 			'#name':function(e){
		 * 				
		 * 			},
		 * 			'#name .label':function(e){
		 * 				
		 * 			}
		 * 		}
		 * }
		 */
		queryEvents:null,
		/**
		 * 调用magix/router的navigate方法
		 * @param {Object|String} params 参数字符串或参数对象
		 */
		navigate:function(params){
			Router.navigate(params);
		},
		/**
		 * 根据选择器添加事件
		 */
		attachQueryEvents:function(){
			var me=this;
			var queryEvents=me.queryEvents;
			if(queryEvents){
				me.$queryEventsCache={};
				for(var p in queryEvents){
					var evts=queryEvents[p];
					for(var q in evts){
						
						S.all('#'+me.id+' '+q).on(p,me.$queryEventsCache[p+'_'+q]=(function(fn){
							return function(e){
								var targetId=View.idIt(e.target);
								var currentId=View.idIt(e.currentTarget);
								Magix.safeExec(fn,{
									view:me,
									targetId:targetId,
									currentId:currentId,
									queryEvents:queryEvents,
									domEvent:e
								},queryEvents);
							}
						}(evts[q])));
					}
				}
			}
			
		},
		/**
		 * 清除根据选择器添加的事件
		 */
		detachQueryEvents:function(){
			var me=this;
			var queryEvents=me.queryEvents;
			if(queryEvents){
				for(var p in queryEvents){
					var evts=queryEvents[p];
					for(var q in evts){
						S.all('#'+me.id+' '+q).detach(p,me.$queryEventsCache[p+'_'+q]);
					}
				}
				delete me.$queryEventsCache;
			}
		},
		setData: function(data) {
	        this.data = data;
	        for (var k in data) {
	            if (data[k]&&data[k].toJSON) {
	                data[k] = data[k].toJSON();
	            }
	        }
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
	    }
	},function(){
		var me=this;
		me.bind('created',function(){
			me.attachQueryEvents();
			me.bind('prerender',function(){
				me.detachQueryEvents();
			});
			me.bind('rendered',function(){
				me.attachQueryEvents();
			});
		});
	});
},{
	requires:["magix/view","magix/router"]
});/**
 * @fileOverview Magix启动入口
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
(function(W){
	var noop=function(){};
	if(!W.console){
		W.console={
			log:noop,
			warn:noop,
			error:noop,
			debug:noop
		}
	}
	if(!W.Magix){
		W.Magix={
			start:function(cfg){
				this.$tempCfg=cfg;
			}
		}
		KISSY.use('magix/magix',function(S,M){
			var cfg=W.Magix.$tempCfg;
			W.Magix=M;
			if(cfg){
				M.start(cfg);
			}
		});
	}
})(this);