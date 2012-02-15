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
	setEnv : function() {
		var me = this,
			magixHome = me.config.magixHome||'',
			appHome = me.config.appHome||'',
			S=KISSY;
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
