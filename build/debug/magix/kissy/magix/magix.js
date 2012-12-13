/**
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
			S.log(x,e);
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
	 * @param {String} cfg.appTag app的资源获取时的后缀tag，增量更新时，清除缓存用
	 * @example
	 * Magix.start({
	 * 		useHistoryState:true,
	 * 		appHome:'http://etao.com/srp/app/',
	 * 		release:false,
	 * 		appTag:'20121205',
	 * 		pathCfg:{
	 * 			defaultView:'app/views/layouts/default',//默认加载的view
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
				mix(locals,key)
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
});