var PathRelativeReg=/\/\.\/|\/[^\/]+?\/\.{2}\/|([^:\/])\/\/+/;
var PathTrimFileReg=/[^\/]*$/;
var PathTrimParamsReg=/[#?].*$/;
var EMPTY='';
var ParamsReg=/([^=&?\/#]+)=([^&=#?]*)/g;
var PATHNAME='pathname';
var ProtocalReg=/^https?:\/\//i;
var Templates={};
var CacheLatest=0;
var Cfg={
    debug:'%DEV%',
    iniFile:'~/ini',
    appName:'app',
    appHome:'./',
    tagName:'vframe',
    rootId:'magix_vf_root'
};
var Has=Templates.hasOwnProperty;

var GSObj=function(o){
    return function(k,v,r){
        switch(arguments.length){
            case 0:
                r=o;
                break;
            case 1:
                if(Magix.isObject(k)){
                    r=mix(o,k)
                }else{
                    r=has(o,k)?o[k]:null;
                }
                break;
            case 2:
                if(v===null){
                    delete o[k];
                    r=v;
                }else{
                    o[k]=r=v;
                }
                break;
        }
        return r;
    }
};
var Cache=function(max){
    var me=this;
    me.c=[];
    me.x=max||20;
    me.b=me.x+5;
};
var CreateCache=function(max){
    return new Cache(max);
};
/**
 * 检测某个对象是否拥有某个属性
 * @param  {Object}  owner 检测对象
 * @param  {String}  prop  属性
 * @return {Boolean} 是否拥有prop属性 
 */
var has=function(owner,prop){
    return owner?Has.call(owner,prop):0;//false 0 null '' undefined
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
        if(ignore===true){
            aim[p]=src[p];
        }else if(has(src,p)&&(!ignore||!has(ignore,p))){
            aim[p]=src[p];
        }
    }
    return aim;
};

mix(Cache.prototype,{
    get:function(key){
        var me=this;
        var c=me.c;
        var r;
        key=PATHNAME+key;
        if(has(c,key)){
            r=c[key];
            if(r.f>=1){
                r.f++;
                r.t=CacheLatest++;
                console.log(r.f);
                r=r.v;
                console.log('hit cache:'+key);
            }
        }
        return r;
    },
    set:function(key,value){
        var me=this;
        var c=me.c;
        
        key=PATHNAME+key;
        var r=c[key];

        if(!has(c,key)){
            if(c.length>=me.b){
                c.sort(function(a,b){return b.f==a.f?b.t-a.t:b.f-a.f});
                var t=me.b-me.x;
                while(t--){
                    r=c.pop();
                    console.log('delete from cache:'+r.k);
                    delete c[r.k];
                }
            }
            r={};
            c.push(r);
            c[key]=r;
        }
        r.k=key;
        r.v=value;
        r.f=1;
        r.t=CacheLatest++;
        return r;
    },
    del:function(k){
        k=PATHNAME+k;
        var c=this.c;
        var r=c[k];
        if(r){
            r.f=-1E5;
            delete c[k];
        }
    }
})

var PathToObjCache=CreateCache(60);
var PathCache=CreateCache();

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
        //KEEP try{/*_*/
            e=fns[i];
            r=Magix.isFunction(e)&&e.apply(context,args);
        //KEEP }catch(x){/*_*/
        //KEEP 
        //KEEP }/*_*/
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
     * 判断是否可转为数字
     * @param  {Object}  o 待检测的对象
     * @return {Boolean}
     */
    isNumeric:function(o){
        return !isNaN(parseFloat(o))&&isFinite(o);
    },
    /**
     * 利用底层类库的包机制加载js文件，仅Magix内部使用，不推荐在app中使用
     * @function
     * @param {String} name 形如app/views/home这样的字符串
     * @param {Function} fn 加载完成后的回调方法
     * @private
     */
    libRequire:unimpl,
    /**
     * 通过xhr同步获取文件的内容，仅开发magix时使用
     * @function
     * @param {String} path 文件路径
     * @return {String} 文件内容
     * @private
     */
    include:unimpl,
    /**
     * 设置底层类库的环境
     * @function
     * @private
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
    has:has,
    /**
     * 以try catch的方式执行方法，忽略掉任何异常
     * @function
     * @param  {Array} fns     函数数组
     * @param  {Array} args    参数数组
     * @param  {Object} context 在待执行的方法内部，this的指向
     * @return {Object} 返回执行的最后一个方法的返回值
     * @example
     * var f1=function(){
     *      throw new Error('msg');
     * };
     *
     * var f2=function(msg){
     *      return 'new_'+msg;
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
     * 配置信息对象
     */
    /**
     * 设置或获取配置信息
     * @function
     * @param {Object} [cfg] 配置信息对象
     * @return {Object} 配置信息对象
     * @example
     * Magix.config({
     *      naviveHistory:true,
     *      appHome:'./test/app'
     * });
     *
     * var config=Magix.config();
     *
     * S.log(config.appHome);
     */
    config:GSObj(Cfg),
    /**
     * magix开始工作
     * @param  {Object} cfg 初始化配置参数对象
     * @param {String} cfg.appHome 当前app所在的文件夹路径 http 形式的 如：http://etao.com/srp/app/
     * @param {Boolean} cfg.debug 指定当前app是否是发布版本，当使用发布版本时，view的html和js应该打包成一个 view-min.js文件，否则Magix在加载view时会分开加载view.js和view.html(view.hasTemplate为true的情况下)
     * @param {Boolean} cfg.nativeHistory 是否使用history state,当为true，并且浏览器支持的情况下会用history.pushState修改url，您应该确保服务器能给予支持。如果nativeHistory为false将使用hash修改url
     * @param {String} cfg.defaultView 默认加载的view
     * @param {String} cfg.defaultPathname 默认view对应的pathname
     * @param {String} cfg.appName 应用的包名，默认app
     * @param {String} cfg.notFoundView 404时加载的view
     * @param {Object} cfg.routes pathname与view映射关系表
     * @param {String} cfg.appTag app的资源获取时的后缀tag，增量更新时，清除缓存用
     * @param {String} cfg.iniFile ini文件位置
     * @param {String} cfg.rootId 根view的id
     * @param {Function} cfg.ready Magix完成配置后触发
     * @param {Array} cfg.extensions 需要加载的扩展
     * @example
     * Magix.start({
     *      useHistoryState:true,
     *      appHome:'http://etao.com/srp/app/',
     *      debug:true,
     *      appTag:'20121205',
     *      iniFile:'',//是否有ini配置文件
     *      defaultView:'app/views/layouts/default',//默认加载的view
     *      defaultPathname:'/home',
     *      routes:{
     *          "/home":"app/views/layouts/default"
     *      }
     * });
     */
    start:function(cfg){
        var me=this;
        cfg=mix(Cfg,cfg);
        me.libEnv(cfg);
        var iniFile=cfg.iniFile.replace('~',cfg.appName);
        me.libRequire(iniFile,function(I){
            Cfg=mix(cfg,I,cfg);
            var progress=cfg.progress;
            me.libRequire(['magix/router','magix/vom'],function(R,V){
                R.on('changed',function(e){
                    if(e.loc){
                        V.locationUpdated(e.loc);
                    }else{
                        if(e.changed.isView()){
                            V.remountRoot(e);
                        }else{
                            V.locationChanged(e);
                        }
                    }
                });
                V.on('progress',progress||noop);
                me.libRequire(cfg.extensions,function(){
                    R.start();
                });
            });
        });
        if(cfg.ready){
            safeExec(cfg.ready);
            delete cfg.ready;
        }
    },
    /**
     * 获取对象的keys
     * @param  {Object} obj 要获取key的对象
     * @return {Array}
     */
    keys:Object.keys||function(obj){
        var keys=[];
        for(var p in obj){
            if(has(obj,p)){
                keys.push(p);
            }
        }
        return keys;
    },
    /**
     * 获取或设置本地数据，您可以把整个app需要共享的数据，通过该方法进行全局存储，方便您在任意view中访问这份数据
     * @function
     * @param {String|Object} key 获取或设置Magix.locals时的key 或者 设置Magix.locals的对象
     * @param {[type]} [val] 设置的对象
     * @return {Object|Undefined}
     * @example
     * Magix.local({//以对象的形式存值
     *      userId:'58782'
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
    local:GSObj({}),
    /**
     * 路径
     * @private
     * @param  {String} url  参考地址
     * @param  {String} part 相对参考地址的片断
     * @return {String}
     * http://www.a.com/a/b.html?a=b#!/home?e=f   /
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ./
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ../../
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ./../
     */
    path:function(url,part){
        var key=url+'\n'+part;
        var result=PathCache.get(key);
        if(!result){
            url=url.replace(PathTrimParamsReg,EMPTY).replace(PathTrimFileReg,EMPTY);
            if(part.charAt(0)=='/'){
                var ds=url.indexOf('://');
                if(ds==-1){
                    result=part;
                }else{
                    var fs=url.indexOf('/',ds+3);
                    if(fs==-1){
                        result=url+part;
                    }else{
                        result=url.substring(0,fs)+part;
                    }
                }
            }else{
                result=url+part;
            }
            //console.log(result);
            while(PathRelativeReg.test(result)){
                //console.log(result);
                result=result.replace(PathRelativeReg,'$1/');
            }
            PathCache.set(key,result);
        }
        return result;
    },
    /**
     * 把路径字符串转换成对象
     * @param  {String} path 路径字符串
     * @return {Object} 解析后的对象
     */
    pathToObject:function(path,decode){
        //把形如 /xxx/a=b&c=d 转换成对象 {pathname:'/xxx/',params:{a:'b',c:'d'}}
        //1. /xxx/a.b.c.html?a=b&c=d  pathname /xxx/a.b.c.html 
        //2. /xxx/?a=b&c=d  pathname /xxx/
        //3. /xxx/#?a=b => pathname /xxx/
        //4. /xxx/index.html# => pathname /xxx/index.html
        //5. /xxx/index.html  => pathname /xxx/index.html
        //6. /xxx/#           => pathname /xxx/
        //7. a=b&c=d          => pathname ''
        //8. /s?src=b#        => pathname /s params:{src:'b'}
        var r=PathToObjCache.get(path);
        if(!r){
            var me=this;
            var r={};
            var params={};

            var pathname=EMPTY;
            if(PathTrimParamsReg.test(path)){//有#?号，表示有pathname
                pathname=path.replace(PathTrimParamsReg,EMPTY)
            }else if(!~path.indexOf('=')){//没有=号，路径可能是 xxx 相对路径 
                pathname=path;
            }
            
            if(pathname){
                if(ProtocalReg.test(pathname)){//解析以https?:开头的网址
                    var first=pathname.indexOf('/',8);//找最近的 / 
                    if(first==-1){//未找到，比如 http://etao.com
                        pathname='/';//则pathname为  /
                    }else{
                        pathname=pathname.substring(first); //截取
                    }
                }
            }
            path.replace(ParamsReg,function(match,name,value){
                if(decode){
                    try{
                        value=decodeURIComponent(value);
                    }catch(e){

                    }
                }
                params[name]=value;
            });
            r[PATHNAME]=pathname;
            r.params=params;
            PathToObjCache.set(path,r);
        }
        return r;
    },
    /**
     * 把对象内容转换成字符串路径
     * @param  {Object} obj 对象
     * @return {String} 字符串路径
     */
    objectToPath:function(obj,encode){//上个方法的逆向
        var pn=obj[PATHNAME];
        var params=[];
        var oPs=obj.params;
        var v;
        for(var p in oPs){
            v=oPs[p];
            if(encode){
                encodeURIComponent(v);
            }
            params.push(p+'='+v);
        }
        return pn+(pn&&params.length?'?':EMPTY)+params.join('&');
    },
    /**
     * 读取或设置view的模板
     * @param  {String} key   形如~seed/app/common/footer的字符串
     * @param  {String} [value] 模板字符串
     * @return {String}
     */
    tmpl:function(key,value){
        if(arguments.length==1){
            return Templates[key];
        }
        return Templates[key]=value;
    },
    /**
     * 把列表转化成hash对象
     * @param  {Array} list 源数组
     * @param  {String} key  以数组中对象的哪个key的value做为hahs的key
     * @return {Object}
     * @example
     * var map=Magix.listToMap([1,2,3,5,6]);
     * //=> {1:1,2:1,3:1,4:1,5:1,6:1}
     *
     * var map=Magix.listToMap([{id:20},{id:30},{id:40}],'id');
     * //=>{20:{id:20},30:{id:30},40:{id:40}}
     *
     * var map=Magix.listToMap('submit,focusin,focusout,mouseenter,mouseleave,mousewheel,change');
     *
     * //=>{submit:1,focusin:1,focusout:1,mouseenter:1,mouseleave:1,mousewheel:1,change:1}
     * 
     */
    listToMap:function(list,key){
        var me=this,i,e,map={},l;
        if(me.isString(list)){
            list=list.split(',');
        }
        if(list&&(l=list.length)){
            for(i=0;i<l;i++){
                e=list[i];
                map[key?e[key]:e]=key?e:1;
            }
        }
        return map;
    },
    /**
     * 创建缓存对象
     * @function
     * @param {Integer} max 最大缓存数
     */
    createCache:CreateCache
};
