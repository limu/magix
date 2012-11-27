
var HAS=Magix.hasProp;

var isParamChanged=function(key){
	return HAS(this.params,key);
};
var isPathnameChanged=function(){
	return HAS(this,PATHNAME);	
};
var isViewPathChanged=function(){
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
var hashParamsHas=function(key){
	var me=this;
	var hash=me.hash;
	return HAS(hash.params,key);
};
var queryParamsHas=function(key){
	var me=this;
	var query=me.query;
	return HAS(query.params,key);
};

var getParams=function(key){
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
		console.log(me);
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
		var params=DECODE(WIN.location.href).replace(/^[^?#]+/g,EMPTY);
		var query=WIN.location[PATHNAME]+params.replace(/^([^#]+).*$/g,'$1');
		var hash=params.replace(/^[^#]*#?/g,EMPTY);//原始hash
		//console.log(query,'---------------------------');
		var me=this;

		var queryObj=me.pathToObject(query);
		//console.log(hash,'___________________',hash.replace(/^!?/,EMPTY));
		var hashObj=me.pathToObject(hash.replace(/^!?/,EMPTY));//去掉可能的！开始符号
		//console.log(hashObj.pathname,'hhhhhhhhhhhhhhhhhhhhhhhhh');
		var comObj={};//把query和hash解析的参数进行合并，用于hash和pushState之间的过度
		Magix.mix(comObj,queryObj.params);
		Magix.mix(comObj,hashObj.params);

		return {
			isPathnameDiff:isPathnameDiff,
			isParamDiff:isParamDiff,
			hashParamsHas:hashParamsHas,
			queryParamsHas:queryParamsHas,
			get:getParams,
			originalQuery:query,
			originalHash:hash,
			query:queryObj,
			hash:hashObj,
			params:comObj
		}
	},
	/**
	 * 解析window.location.href字符串为对象
	 * @return {Object}
	 */
	parseLocation:function(){
		var me=this;
		var queryHash=me.parseQueryAndHash();

		//console.log(queryHash,HAS(queryHash,'query'));

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
			//console.log(queryHash.hash.pathname,';;;;;;;;;;;;;;;;;');
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
		temp.isParamChanged=isParamChanged;
		temp.isPathnameChanged=isPathnameChanged;
		temp.isViewPathChanged=isViewPathChanged;
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
		var isFirstFired=!me.$location;//是否强制触发的locationChange，对于首次加载会强制触发一次
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
				isFirstFired:isFirstFired
			});
		}
		me.$location=location;
		me.$referrer=DECODE(WIN.location.href);
		
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
					//console.log('xxxxxxxxxxxxxxxxx',me.$location.pathname);
					pathObj.params=tempParams;
					pathObj[PATHNAME]=me.$location[PATHNAME];//使用原始的pathname
				}
				//console.log('string path to object',pathObj);
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
	 * @param {Boolean} e.isFirstFired 标识是否是第一次强制触发的locationChanged，对于首次加载完Magix，会强制触发一次locationChanged
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