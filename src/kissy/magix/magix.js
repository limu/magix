/*
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
	_fireHashchangeListen:function(hash){
		var me=this,
			list=me.$hashchangeList;
		
		if(list&&list.length){
			for(var i=0;i<list.length;i++){
				try{
					list[i]();
				}catch(e){

				}
			}
		}
	},
	listenHashchange:function(fn){
		var me=this;
		if(!me.$hashchangeList)me.$hashchangeList=[];
		me.$hashchangeList.push(fn);
	},
	unlistenHashchange:function(fn){
		var me=this,
			list=me.$hashchangeList;
		for(var i=0;i<list.length;i++){
			if(list[i]==fn){
				list.splice(i,1);
				break;
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
	dev:'%DEV%'
};
