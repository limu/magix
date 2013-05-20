/**
 * @fileOverview magix中根据底层类库需要重写的方法
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/impl/magix',function(S,Slice){
    Slice=[].slice;
    return {
        
        libRequire:function(name,fn){
            var me=this;
            if(name){
                var isFn=me.isFunction(fn);
                var isArr=me.isArray(name);

                S.use(isArr?name.join(','):name,isFn?function(S){
                    fn.apply(S,Slice.call(arguments,1));
                }:me.noop);
            }else{
                fn();
            }
        },
        libEnv:function(cfg){
            var me=this;
            var appHome=cfg.appHome;
            var loc=location;
            var protocol=loc.protocol;
            var appName=cfg.appName;

            if(!~appHome.indexOf(protocol)){
                appHome=me.path(loc.href,appHome);
            }

            if(!S.endsWith(appHome,'/')){
                appHome+='/';
            }
            cfg.appHome=appHome;
            var debug=cfg.debug;
            if(debug){
                debug=appHome.indexOf(protocol+'//'+loc.host)==0;
            }
            if(appName.charAt(0)=='~'){
                var reg=new RegExp('/'+appName+'/');
                S.config({
                    map:[[reg,'/']]
                });
            }
            var appTag='';
            if(debug){
                appTag=S.now();
            }else{
                appTag=cfg.appTag;
            }
            if(appTag){
                appTag+='.js';
            }
            var appCombine=cfg.appCombine;
            if(S.isUndefined(appCombine)){
                appCombine=S.config('combine');
            }
            S.config({
                packages:[{
                    name:appName,
                    path:appHome,
                    debug:cfg.debug=debug,
                    combine:appCombine,
                    tag:appTag
                }]
            });
        },
        isArray:S.isArray,
        isFunction:S.isFunction,
        isObject:S.isObject,
        isRegExp:S.isRegExp,
        isString:S.isString,
        isNumber:S.isNumber
    }
});