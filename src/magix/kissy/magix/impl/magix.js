/**
 * @fileOverview magix中根据底层类库需要重写的方法
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/impl/magix',function(S){
	return {
		include:function(path){
			var url = S.Config.packages.magix.path+path + ".js?r=" + Math.random()+'.js';
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
			var appTag='';
			if(cfg.release){
				appTag=cfg.appTag;
			}else{
				appTag=S.now();
			}
			if(appTag){
				appTag+='.js';
			}
			S.config({
				packages:[{
					name:'app',
					path:appHome,
					tag:appTag
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
});