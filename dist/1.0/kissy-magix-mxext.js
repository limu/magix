/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add('magix/magix', function(S) {
    var Slice = [].slice;

    var Include = function(path, mxext) {
        var magixPackages = S.Config.packages[mxext ? 'mxext' : 'magix'];
        var mPath = magixPackages.base || magixPackages.path;

        var url = mPath + path + ".js?r=" + Math.random() + '.js';
        var xhr = window.ActiveXObject || window.XMLHttpRequest;
        var r = new xhr('Microsoft.XMLHTTP');
        r.open('GET', url, false);
        r.send(null);
        return r.responseText;
    };
    var PathRelativeReg = /\/\.\/|\/[^\/]+?\/\.{2}\/|([^:\/])\/\/+/;
var PathTrimFileReg = /\/[^\/]*$/;
var PathTrimParamsReg = /[#?].*$/;
var EMPTY = '';
var ParamsReg = /([^=&?\/#]+)=?([^&=#?]*)/g;
var PATHNAME = 'pathname';
var ProtocalReg = /^https?:\/\//i;
var Templates = {};
var CacheLatest = 0;
var Slash = '/';
var DefaultTagName = 'vframe';
/**
待重写的方法
@method imimpl
**/
var unimpl = function() {
    throw new Error('unimplement method');
};
/**
 * 空方法
 */
var noop = function() {};
var Cfg = {
    debug:'*_*',
    iniFile: 'app/ini',
    appName: 'app',
    appHome: './',
    tagName: DefaultTagName,
    rootId: 'magix_vf_root',
    execError: noop
};
var Has = Templates.hasOwnProperty;

var GSObj = function(o) {
    return function(k, v, r) {
        switch (arguments.length) {
            case 0:
                r = o;
                break;
            case 1:
                if (Magix.isObject(k)) {
                    r = mix(o, k);
                } else {
                    r = has(o, k) ? o[k] : null;
                }
                break;
            case 2:
                if (v === null) {
                    delete o[k];
                    r = v;
                } else {
                    o[k] = r = v;
                }
                break;
        }
        return r;
    };
};
var Cache = function(max) {
    var me = this;
    me.c = [];
    me.x = max || 20;
    me.b = me.x + 5;
};
var CreateCache = function(max) {
    return new Cache(max);
};
/**
 * 检测某个对象是否拥有某个属性
 * @param  {Object}  owner 检测对象
 * @param  {String}  prop  属性
 * @return {Boolean} 是否拥有prop属性
 */
var has = function(owner, prop) {
    return owner ? Has.call(owner, prop) : 0; //false 0 null '' undefined
};

/**
 * 混合对象的属性
 * @param  {Object} aim    要mix的目标对象
 * @param  {Object} src    mix的来源对象
 * @param  {Object} ignore 在复制时，忽略的值
 * @return {Object}
 */
var mix = function(aim, src, ignore) {
    for (var p in src) {
        if (!ignore || !has(ignore, p)) {
            aim[p] = src[p];
        }
    }
    return aim;
};

mix(Cache.prototype, {
    get: function(key) {
        var me = this;
        var c = me.c;
        var r;
        key = PATHNAME + key;
        if (has(c, key)) {
            r = c[key];
            if (r.f >= 1) {
                r.f++;
                r.t = CacheLatest++;
                //
                r = r.v;
                //
            }
        }
        return r;
    },
    set: function(key, value) {
        var me = this;
        var c = me.c;

        key = PATHNAME + key;
        var r = c[key];

        if (!has(c, key)) {
            if (c.length >= me.b) {
                c.sort(function(a, b) {
                    return b.f == a.f ? b.t - a.t : b.f - a.f;
                });
                var t = me.b - me.x;
                while (t--) {
                    r = c.pop();
                    //
                    delete c[r.k];
                }
            }
            r = {};
            c.push(r);
            c[key] = r;
        }
        r.k = key;
        r.v = value;
        r.f = 1;
        r.t = CacheLatest++;
        return r;
    },
    del: function(k) {
        k = PATHNAME + k;
        var c = this.c;
        var r = c[k];
        if (r) {
            r.f = -1E5;
            r.v = EMPTY;
            delete c[k];
        }
    },
    has: function(k) {
        k = PATHNAME + k;
        return has(this.c, k);
    }
});

var PathToObjCache = CreateCache(60);
var PathCache = CreateCache();

/**
 * 以try cache方式执行方法，忽略掉任何异常
 * @param  {Array} fns     函数数组
 * @param  {Array} args    参数数组
 * @param  {Object} context 在待执行的方法内部，this的指向
 * @return {Object} 返回执行的最后一个方法的返回值
 */
var safeExec = function(fns, args, context, i, r, e) {
    if (!Magix.isArray(fns)) {
        fns = [fns];
    }
    if (!args || (!Magix.isArray(args) && !args.callee)) {
        args = [args];
    }
    for (i = 0; i < fns.length; i++) {
        
        e = fns[i];
        r = Magix.isFunction(e) && e.apply(context, args);
        
         
        
    }
    return r;
};



/**
 * Magix全局对象
 * @name Magix
 * @namespace
 */
var Magix = {
    /**
     * @lends Magix
     */
    /**
     * 判断o是否为数组
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    
    /**
     * 判断o是否为对象
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    
    /**
     * 判断o是否为函数
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    
    /**
     * 判断o是否为正则
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    
    /**
     * 判断o是否为字符串
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    
    /**
     * 判断o是否为数字
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    
    /**
     * 判断是否可转为数字
     * @param  {Object}  o 待检测的对象
     * @return {Boolean}
     */
    isNumeric: function(o) {
        return !isNaN(parseFloat(o)) && isFinite(o);
    },
    /**
     * 利用底层类库的包机制加载js文件，仅Magix内部使用，不推荐在app中使用
     * @function
     * @param {String} name 形如app/views/home这样的字符串
     * @param {Function} fn 加载完成后的回调方法
     * @private
     */
    
    /**
     * 通过xhr同步获取文件的内容，仅开发magix时使用
     * @function
     * @param {String} path 文件路径
     * @return {String} 文件内容
     * @private
     */
    
    /**
     * 设置底层类库的环境
     * @function
     * @private
     */
    
    /**
     * 把src对象的值混入到aim对象上
     * @function
     * @param  {Object} aim    要mix的目标对象
     * @param  {Object} src    mix的来源对象
     * @param  {Object} [ignore] 在复制时，需要忽略的key
     * @return {Object}
     */
    mix: mix,
    /**
     * 未实现的方法
     * @function
     * @type {Function}
     * @private
     */
    
    /**
     * 检测某个对象是否拥有某个属性
     * @function
     * @param  {Object}  owner 检测对象
     * @param  {String}  prop  属性
     * @return {Boolean} 是否拥有prop属性
     */
    has: has,
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
    safeExec: safeExec,
    /**
     * 空方法
     * @function
     */
    noop: noop,
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
    config: GSObj(Cfg),
    /**
     * 应用初始化入口
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
     * @param {Function} cfg.execError 发布版以try catch执行一些用户重写的核心流程，当出错时，允许开发者通过该配置项进行捕获。注意：您不应该在该方法内再次抛出任何错误！
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
    start: function(cfg) {
        var me = this;
        mix(Cfg, cfg);
        me.libEnv(Cfg);
        if (Cfg.ready) {
            safeExec(Cfg.ready);
            delete Cfg.ready;
        }
        me.libRequire(Cfg.iniFile, function(I) {
            Cfg = mix(Cfg, I, cfg);
            Cfg.tagNameChanged = Cfg.tagName != DefaultTagName;

            var progress = Cfg.progress;
            me.libRequire(['magix/router', 'magix/vom'], function(R, V) {
                R.on('!ul', V.locChged);
                R.on('changed', V.locChged);
                if (progress) {
                    V.on('progress', progress);
                }
                me.libRequire(Cfg.extensions, R.start);
            });
        });
    },
    /**
     * 获取对象的keys
     * @function
     * @param  {Object} obj 要获取key的对象
     * @return {Array}
     */
    keys: Object.keys || function(obj) {
        var keys = [];
        for (var p in obj) {
            if (has(obj, p)) {
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
    local: GSObj({}),
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
    path: function(url, part) {
        var key = url + '\n' + part;
        var result = PathCache.get(key);
        if (!result) {
            if (ProtocalReg.test(part)) {
                result = part;
            } else {
                url = url.replace(PathTrimParamsReg, EMPTY).replace(PathTrimFileReg, EMPTY) + Slash;

                if (part.charAt(0) == Slash) {
                    var ds = ProtocalReg.test(url) ? 8 : 0;
                    var fs = url.indexOf(Slash, ds);

                    /* if(fs==-1){
                        result=url+part;
                    }else{*/
                    result = url.substring(0, fs) + part;
                    //}

                } else {
                    result = url + part;
                }
            }
            //
            while (PathRelativeReg.test(result)) {
                //
                result = result.replace(PathRelativeReg, '$1/');
            }
            PathCache.set(key, result);
        }
        return result;
    },
    /**
     * 把路径字符串转换成对象
     * @param  {String} path 路径字符串
     * @return {Object} 解析后的对象
     * @example
     * var obj=Magix.pathToObject)('/xxx/?a=b&c=d');
     * //obj={pathname:'/xxx/',params:{a:'b',c:'d'}}
     */
    pathToObject: function(path, decode) {
        //把形如 /xxx/a=b&c=d 转换成对象 {pathname:'/xxx/',params:{a:'b',c:'d'}}
        //1. /xxx/a.b.c.html?a=b&c=d  pathname /xxx/a.b.c.html
        //2. /xxx/?a=b&c=d  pathname /xxx/
        //3. /xxx/#?a=b => pathname /xxx/
        //4. /xxx/index.html# => pathname /xxx/index.html
        //5. /xxx/index.html  => pathname /xxx/index.html
        //6. /xxx/#           => pathname /xxx/
        //7. a=b&c=d          => pathname ''
        //8. /s?src=b#        => pathname /s params:{src:'b'}
        var r = PathToObjCache.get(path);
        if (!r) {
            r = {};
            var params = {};

            var pathname = EMPTY;
            if (PathTrimParamsReg.test(path)) { //有#?号，表示有pathname
                pathname = path.replace(PathTrimParamsReg, EMPTY);
            } else if (!~path.indexOf('=')) { //没有=号，路径可能是 xxx 相对路径
                pathname = path;
            }
            var querys = path.replace(pathname, EMPTY);

            if (pathname) {
                if (ProtocalReg.test(pathname)) { //解析以https?:开头的网址
                    var first = pathname.indexOf(Slash, 8); //找最近的 /
                    if (first == -1) { //未找到，比如 http://etao.com
                        pathname = Slash; //则pathname为  /
                    } else {
                        pathname = pathname.substring(first); //截取
                    }
                }
            }
            querys.replace(ParamsReg, function(match, name, value) {
                if (decode) {
                    try {
                        value = decodeURIComponent(value);
                    } catch (e) {

                    }
                }
                params[name] = value;
            });
            r[PATHNAME] = pathname;
            r.params = params;
            PathToObjCache.set(path, r);
        }
        return r;
    },
    /**
     * 把对象内容转换成字符串路径
     * @param  {Object} obj 对象
     * @return {String} 字符串路径
     * @example
     * var str=Magix.objectToPath({pathname:'/xxx/',params:{a:'b',c:'d'}});
     * //str==/xxx/?a=b&c=d
     */
    objectToPath: function(obj, encode) { //上个方法的逆向
        var pn = obj[PATHNAME];
        var params = [];
        var oPs = obj.params;
        var v;
        for (var p in oPs) {
            v = oPs[p];
            if (encode) {
                v=encodeURIComponent(v);
            }
            params.push(p + '=' + v);
        }
        if (params.length) {
            pn = pn + '?' + params.join('&');
        }
        return pn;
    },
    /**
     * 读取或设置view的模板
     * @param  {String} key   形如~seed/app/common/footer的字符串
     * @param  {String} [value] 模板字符串
     * @return {String}
     */
    tmpl: function(key, value) {
        if (arguments.length == 1) {
            return {
                v: Templates[key],
                h: has(Templates, key)
            };
        }
        Templates[key] = value;
        return value;
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
    listToMap: function(list, key) {
        var i, e, map = {}, l;
        if (Magix.isString(list)) {
            list = list.split(',');
        }
        if (list && (l = list.length)) {
            for (i = 0; i < l; i++) {
                e = list[i];
                map[key ? e[key] : e] = key ? e : 1;
            }
        }
        return map;
    },
    /**
     * 创建缓存对象
     * @function
     * @param {Integer} max 最大缓存数
     * @param {Integer} buffer 缓冲区大小
     * @example
     * var c=Magix.cache(5,2);//创建一个可缓存5个，且缓存区为2个的缓存对象
     * c.set('key1',{});//缓存
     * c.get('key1');//获取
     * c.del('key1');//删除
     * c.has('key1');//判断
     * //注意：缓存通常配合其它方法使用，不建议单独使用。在Magix中，对路径的解释等使用了缓存。在使用缓存优化性能时，可以达到节省CPU和内存的双赢效果
     */
    cache: CreateCache
};
    return mix(Magix, {
        
        libRequire: function(name, fn) {
            if (name) {
                S.use(String(name), function(S) {
                    if (fn) {
                        fn.apply(S, Slice.call(arguments, 1));
                    }
                });
            } else if (fn) {
                fn();
            }
        },
        libEnv: function(cfg) {
            var me = this;
            var appHome = cfg.appHome;
            var loc = location;
            var protocol = loc.protocol;
            var appName = cfg.appName;

            appHome = me.path(loc.href, appHome + Slash);

            /* if(!S.endsWith(appHome,Slash)){
                appHome+=Slash;
            }*/

            cfg.appHome = appHome;
            var debug = cfg.debug;

            if (debug) {
                debug = appHome.indexOf(loc.protocol + Slash + Slash + loc.host + Slash) == 0;
            }
            /*if(appName.charAt(0)=='~'){
                var reg=new RegExp(Slash+appName+Slash);
                S.config({
                    map:[[reg,Slash]]
                });
            }*/
            var appTag = EMPTY;
            if (debug) {
                appTag = S.now();
            } else {
                appTag = cfg.appTag;
            }
            if (appTag) {
                appTag += '.js';
            }
            /* var appCombine=cfg.appCombine;
            if(S.isUndefined(appCombine)){
                appCombine=S.config('combine');
            }*/
            S.config({
                packages: [{
                    name: appName,
                    path: appHome,
                    debug: cfg.debug = debug,
                    combine: cfg.appCombine,
                    tag: appTag
                }]
            });
        },
        isArray: S.isArray,
        isFunction: S.isFunction,
        isObject: S.isObject,
        isRegExp: S.isRegExp,
        isString: S.isString,
        isNumber: S.isNumber
    });
});
/**
 * @fileOverview 路由
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/router',function(S,Magix,Event,SE){
    var WIN = window;
var EMPTY = '';
var PATHNAME = 'pathname';

var Has = Magix.has;
var Mix = Magix.mix;
var D = document;
var IsUtf8 = /^UTF-8$/i.test(D.charset || D.characterSet || 'UTF-8');
var MxConfig = Magix.config();
var HrefCache = Magix.cache();
var ChgdCache = Magix.cache();

var TLoc, LLoc, Pnr;
var TrimHashReg = /#.*$/,
    TrimQueryReg = /^[^#]*#?!?/;
var PARAMS = 'params';
var UseNativeHistory = MxConfig.nativeHistory;
var SupportState, HashAsNativeHistory;

var isParam = function(params, r, ps) {
    if (params) {
        ps = this[PARAMS];
        if (!Magix.isArray(params)) params = params.split(',');
        for (var i = 0; i < params.length; i++) {
            r = Has(ps, params[i]);
            if (r) break;
        }
    }
    return r;
};
var isPathname = function() {
    return Has(this, PATHNAME);
};
var isView = function() {
    return Has(this, 'view');
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
    var keys=Magix.keys(this[PARAMS]);
    for(i=0;i<keys.length;i++){
        if(!Has(temp,keys[i])){
            return true;
        }
    }
    return false;
};*/
var pathnameDiff = function() {
    var me = this;
    var hash = me.hash;
    var query = me.query;
    return hash[PATHNAME] != query[PATHNAME];
};
var paramDiff = function(param) {
    var me = this;
    var hash = me.hash;
    var query = me.query;
    return hash[PARAMS][param] != query[PARAMS][param];
};
var hashOwn = function(key) {
    var me = this;
    var hash = me.hash;
    return Has(hash[PARAMS], key);
};
var queryOwn = function(key) {
    var me = this;
    var query = me.query;
    return Has(query[PARAMS], key);
};

var getParam = function(key) {
    var me = this;
    var params = me[PARAMS];
    return params[key];
};

var Path = function(path) {
    var o = Magix.pathToObject(path, IsUtf8);
    var pn = o[PATHNAME];
    if (pn && HashAsNativeHistory) { //如果不是以/开头的并且要使用history state,当前浏览器又不支持history state则放hash中的pathname要进行处理
        o[PATHNAME] = Magix.path(WIN.location[PATHNAME], pn);
    }
    return o;
};

//var PathTrimFileParamsReg=/(\/)?[^\/]*[=#]$/;//).replace(,'$1').replace(,EMPTY);
//var PathTrimSearch=/\?.*$/;
/**
 * @name Router
 * @namespace
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.un as un
 */
var Router = Mix({
    /**
     * @lends Router
     */
    /**
     * 使用history state做为改变url的方式来保存当前页面的状态
     * @function
     * @private
     */
    
    /**
     * 使用hash做为改变url的方式来保存当前页面的状态
     * @function
     * @private
     */
    
    /**
     * 根据地址栏中的pathname获取对应的前端view
     * @param  {String} pathname 形如/list/index这样的pathname
     * @return {String} 返回形如app/views/layouts/index这样的字符串
     * @private
     */
    getView: function(pathname, loc) {

        if (!Pnr) {
            Pnr = {
                rs: MxConfig.routes || {},
                nf: MxConfig.notFoundView
            };
            //var home=pathCfg.defaultView;//处理默认加载的view
            //var dPathname=pathCfg.defaultPathname||EMPTY;
            var defaultView = MxConfig.defaultView;
            if (!defaultView) {
                throw new Error('unset defaultView');
            }
            Pnr.home = defaultView;
            var defaultPathname = MxConfig.defaultPathname || EMPTY;
            //if(!Magix.isFunction(temp.rs)){
            Pnr.rs[defaultPathname] = defaultView;
            Pnr[PATHNAME] = defaultPathname;
        }

        var result;

        if (!pathname) pathname = Pnr[PATHNAME];
        //
        var r = Pnr.rs;
        if (Magix.isFunction(r)) {
            result = r.call(MxConfig, pathname, loc);
        } else {
            result = r[pathname]; //简单的在映射表中找
        }

        return {
            view: result ? result : Pnr.nf || Pnr.home,
            pathname: result || UseNativeHistory ? pathname : (Pnr.nf ? pathname : Pnr[PATHNAME])
        };
    },
    /**
     * 开始路由工作
     * @private
     */
    start: function() {
        var me = Router;
        var H = WIN.history;

        SupportState = UseNativeHistory && H.pushState;
        HashAsNativeHistory = UseNativeHistory && !SupportState;

        if (SupportState) {
            me.useState();
        } else {
            me.useHash();
        }
        me.route(); //页面首次加载，初始化整个页面
    },

    /**
     * 解析href的query和hash，默认href为window.location.href
     * @param {String} [href] href
     * @return {Object} 解析的对象
     */
    parseQH: function(href, inner) {
        href = href || WIN.location.href;

        var me = Router;
        /*var cfg=Magix.config();
        if(!cfg.originalHREF){
            try{
                href=DECODE(href);//解码有问题 http://fashion.s.etao.com/search?q=%CF%CA%BB%A8&initiative_id=setao_20120529&tbpm=t => error:URIError: malformed URI sequence
            }catch(ignore){

            }
        }*/
        var result = HrefCache.get(href);
        if (!result) {
            var query = href.replace(TrimHashReg, EMPTY);
            //
            //var query=tPathname+params.replace(/^([^#]+).*$/g,'$1');
            var hash = href.replace(TrimQueryReg, EMPTY); //原始hash
            //
            var queryObj = Path(query);
            //
            var hashObj = Path(hash); //去掉可能的！开始符号
            //
            var comObj = {}; //把query和hash解析的参数进行合并，用于hash和pushState之间的过度
            Mix(comObj, queryObj[PARAMS]);
            Mix(comObj, hashObj[PARAMS]);
            result = {
                pathnameDiff: pathnameDiff,
                paramDiff: paramDiff,
                hashOwn: hashOwn,
                queryOwn: queryOwn,
                get: getParam,
                href: href,
                srcQuery: query,
                srcHash: hash,
                query: queryObj,
                hash: hashObj,
                params: comObj
            };
            HrefCache.set(href, result);
        }
        if (inner && !result.view) {
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
            if (UseNativeHistory) { //指定使用history state
                /*
                if(me.supportState()){//当前浏览器也支持
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
                tempPathname = result.hash[PATHNAME] || result.query[PATHNAME];
            } else { //指定不用history state ，那咱还能说什么呢，直接用hash
                tempPathname = result.hash[PATHNAME];
            }
            var view = me.getView(tempPathname, result);
            Mix(result, view);
        }
        return result;
    },
    /**
     * 获取2个location对象之间的差异部分
     * @param  {Object} oldLocation 原始的location对象
     * @param  {Object} newLocation 当前的location对象
     * @return {Object} 返回包含差异信息的对象
     * @private
     */
    getChged: function(oldLocation, newLocation) {
        var oKey = oldLocation.href;
        var nKey = newLocation.href;
        var tKey = oKey + '\n' + nKey;
        var result = ChgdCache.get(tKey);
        if (!result) {
            tKey = nKey + '\n' + tKey;
            result = ChgdCache.get(tKey);
        }
        if (!result) {
            var hasChanged;
            result = {
                params: {}
            };
            if (oldLocation[PATHNAME] != newLocation[PATHNAME]) {
                result[PATHNAME] = 1;
                hasChanged = 1;
            }
            if (oldLocation.view != newLocation.view) {
                result.view = 1;
                hasChanged = 1;
            }
            var oldParams = oldLocation[PARAMS],
                newParams = newLocation[PARAMS];
            var p;
            for (p in oldParams) {
                if (oldParams[p] != newParams[p]) {
                    hasChanged = 1;
                    result[PARAMS][p] = 1;
                }
            }

            for (p in newParams) {
                if (oldParams[p] != newParams[p]) {
                    hasChanged = 1;
                    result[PARAMS][p] = 1;
                }
            }
            result.occur = hasChanged;
            result.isParam = isParam;
            result.isPathname = isPathname;
            result.isView = isView;
            ChgdCache.set(tKey, result);
        }
        return result;
    },
    /**
     * 根据window.location.href路由并派发相应的事件
     */
    route: function() {
        var me = Router;
        var location = me.parseQH(0, 1);
        var oldLocation = LLoc || {
            params: {},
            href: '~'
        };
        var firstFire = !LLoc; //是否强制触发的changed，对于首次加载会强制触发一次

        LLoc = location;

        var changed = me.getChged(oldLocation, location);
        if (changed.occur) {
            TLoc = location;
            me.fire('changed', {
                location: location,
                changed: changed,
                force: firstFire
            });
        }
    },
    /**
     * 导航到新的地址
     * @param  {Object|String} pn pathname或参数字符串或参数对象
     * @param {String|Object} [params] 参数对象
     * @param {Boolean} [replace] 是否替换当前历史记录
     * @example
     * KISSY.use('magix/router',function(S,R){
     *      R.navigate('/list?page=2&rows=20');//改变pathname和相关的参数，地址栏上的其它参数会进行丢弃，不会保留
     *      R.navigate('page=2&rows=20');//只修改参数，地址栏上的其它参数会保留
     *      R.navigate({//通过对象修改参数，地址栏上的其它参数会保留
     *          page:2,
     *          rows:20
     *      });
     *      R.navigate('/list',{
     *          page:2,
     *          rows:20
     *      })
     * });
     */
    /*
        1.
            render:function(){
            },
            events:{
                click:{
                    changeHash:function(e){
                        Router.navigate('a='+S.now());
                        Router.navigate('b='+S.now());
                        e.view.render();
                    }
                }
            }
     */
    navigate: function(pn, params, replace) {
        var me = Router;

        if (!params && Magix.isObject(pn)) {
            params = pn;
            pn = EMPTY;
        }
        if (params) {
            pn = Magix.objectToPath({
                params: params,
                pathname: pn
            }, IsUtf8);
        }
        //TLoc引用
        //pathObj引用
        //
        //temp={params:{},pathname:{}}
        //
        //Mix(temp,TLoc,temp);
        //
        //

        if (pn) {

            var pathObj = Path(pn);
            var temp = {};
            temp[PARAMS] = Mix({}, pathObj[PARAMS]);
            temp[PATHNAME] = pathObj[PATHNAME];

            if (temp[PATHNAME]) {
                if (HashAsNativeHistory) { //指定使用history state但浏览器不支持，需要把query中的存在的参数以空格替换掉
                    var query = TLoc.query;
                    if (query && (query = query[PARAMS])) {
                        for (var p in query) {
                            if (Has(query, p) && !Has(temp[PARAMS], p)) {
                                temp[PARAMS][p] = EMPTY;
                            }
                        }
                    }
                }
            } else {
                var ps = Mix({}, TLoc[PARAMS]);
                temp[PARAMS] = Mix(ps, temp[PARAMS]);
                temp[PATHNAME] = TLoc[PATHNAME];
            }
            var tempPath = Magix.objectToPath(temp,IsUtf8);

            var navigate;

            if (SupportState) {
                navigate = tempPath != TLoc.srcQuery;
            } else {
                navigate = tempPath != TLoc.srcHash;
            }

            if (navigate) {

                if (SupportState) { //如果使用pushState
                    me.poped = 1;
                    history[replace ? 'replaceState' : 'pushState'](null, null, tempPath);
                    me.route();
                } else {
                    Mix(temp, TLoc, temp);
                    temp.srcHash = tempPath;
                    temp.hash = {
                        params: temp[PARAMS],
                        pathname: temp[PATHNAME]
                    };
                    /*
                        window.onhashchange=function(e){
                        };
                        (function(){
                            location.hash='a';
                            location.hash='b';
                            location.hash='c';
                        }());


                     */
                    me.fire('!ul', {
                        loc: TLoc = temp
                    }); //hack 更新view的location属性
                    tempPath = '#!' + tempPath;
                    if (replace) {
                        location.replace(tempPath);
                    } else {
                        location.hash = tempPath;
                    }
                }
            }
        }
    }

    /**
     * 当window.location.href有改变化时触发
     * @name Router.changed
     * @event
     * @param {Object} e 事件对象
     * @param {Object} e.location 地址解析出来的对象，包括query hash 以及 query和hash合并出来的params等
     * @param {Object} e.changed 有哪些值发生改变的对象
     * @param {Boolean} e.force 标识是否是第一次强制触发的changed，对于首次加载完Magix，会强制触发一次changed
     */

    /**
     * 当window.location.href有改变化时触发（该事件在扩展中实现）
     * @name Router.change
     * @event
     * @param {Object} e 事件对象
     * @param {Object} e.location 地址解析出来的对象，包括query hash 以及 query和hash合并出来的params等
     * @param {Function} e.back 回退到变化前的地址上，阻止跳转
     */

}, Event);
    Router.useState=function(){
        var me=Router,initialURL=location.href;
        SE.on(WIN,'popstate',function(e){
            var equal=location.href==initialURL;
            if(!me.poped&&equal)return;
            me.poped=1;
            me.route();
        });
    };
    Router.useHash=function(){//extension impl change event
        SE.on(WIN,'hashchange',Router.route);
    };
    return Router;
},{
    requires:["magix/magix","magix/event","event"]
});
/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add("magix/body",function(S,Magix,SE){
    var Has = Magix.has;
//不支持冒泡的事件
var UnsupportBubble = Magix.listToMap('submit,focusin,focusout,mouseenter,mouseleave,mousewheel,change');
var RootNode = document.body;
var RootEvents = {};


var MxOwner = 'mx-owner';
var MxIgnore = 'mx-ie';
var TypesRegCache = {};
var IdCounter = 1 << 16;

var IdIt = function(dom) {
    return dom.id || (dom.id = 'mx-e-' + (IdCounter--));
};
var GetSetAttribute = function(dom, attrKey, attrVal) {
    if (attrVal) {
        dom.setAttribute(attrKey, attrVal);
    } else {
        attrVal = dom.getAttribute(attrKey);
    }
    return attrVal;
};
var VOM;
var Body = {
    

    process: function(e) {
        var target = e.target || e.srcElement;
        while (target && target.nodeType != 1) {
            target = target.parentNode;
        }
        var current = target;
        var eventType = e.type;
        var eventReg = TypesRegCache[eventType] || (TypesRegCache[eventType] = new RegExp('(?:^|,)' + eventType + '(?:,|$)'));
        //
        if (!eventReg.test(GetSetAttribute(target, MxIgnore))) {
            var type = 'mx-' + eventType;
            var info;
            var ignore;
            var arr = [];
            while (current && current != RootNode) { //找事件附近有mx[a-z]+事件的DOM节点
                info = GetSetAttribute(current, type);
                ignore = GetSetAttribute(current, MxIgnore); //current.getAttribute(MxIgnore);
                if (info || eventReg.test(ignore)) {
                    break;
                } else {
                    //
                    arr.push(current);
                    current = current.parentNode;
                }
            }
            if (info) { //有事件
                //找处理事件的vframe
                var handler = GetSetAttribute(current, MxOwner); //current.getAttribute(MxOwner);
                if (!handler) { //如果没有则找最近的vframe
                    var begin = current;
                    var vfs = VOM.all();
                    while (begin && begin != RootNode) {
                        if (Has(vfs, begin.id)) {
                            GetSetAttribute(current, MxOwner, handler = begin.id);
                            //current.setAttribute(MxOwner,handler=begin.id);
                            break;
                        } else {
                            begin = begin.parentNode;
                        }
                    }
                }
                if (handler) { //有处理的vframe,派发事件，让对应的vframe进行处理

                    var vframe = VOM.get(handler);
                    var view = vframe && vframe.view;
                    if (view) {
                        view.processEvent({
                            info: info,
                            se: e,
                            tId: IdIt(target),
                            cId: IdIt(current)
                        });
                    }
                } else {
                    throw Error('miss ' + MxOwner + ':' + info);
                }
            } else {
                var node;
                while (arr.length) {
                    node = arr.shift();
                    ignore = GetSetAttribute(node, MxIgnore); //node.getAttribute(MxIgnore);
                    if (!eventReg.test(ignore)) {
                        ignore = ignore ? ignore + ',' + eventType : eventType;
                        GetSetAttribute(node, MxIgnore, ignore);
                        //node.setAttribute(MxIgnore,ignore);
                    }
                }
            }
        }
    },
    on: function(type, vom) {
        var me = this;
        if (!RootEvents[type]) {

            VOM = vom;
            RootEvents[type] = 1;
            var unbubble = UnsupportBubble[type];
            if (unbubble) {
                me.unbubble(0, RootNode, type);
            } else {
                RootNode['on' + type] = function(e) {
                    e = e || window.event;
                    if (e) {
                        me.process(e);
                    }
                };
            }
        } else {
            RootEvents[type]++;
        }
    },
    un: function(type) {
        var me = this;
        var counter = RootEvents[type];
        if (counter > 0) {
            counter--;
            if (!counter) {
                var unbubble = UnsupportBubble[type];
                if (unbubble) {
                    me.unbubble(1, RootNode, type);
                } else {
                    RootNode['on' + type] = null;
                }
            }
            RootEvents[type] = counter;
        }
    }
};
    Body.unbubble=function(remove,node,type){
    	var fn=remove?SE.undelegate:SE.delegate;
    	fn.call(SE,node,type,'[mx-'+type+']',Body.process);
    };
    return Body;
},{
    requires:["magix/magix","event","sizzle"]
});
/**
 * @fileOverview 多播事件对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add("magix/event",function(S,Magix){
    /**
 * 根据名称生成事件数组的key
 * @param {Strig} name 事件名称
 * @return {String} 包装后的key
 */
var GenKey = function(name) {
    return '~' + name;
};

var SafeExec = Magix.safeExec;
/**
 * 多播事件对象
 * @name Event
 * @namespace
 */
var Event = {
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
    fire: function(name, data, remove, lastToFirst) {
        var key = GenKey(name),
            me = this,
            list = me[key];
        if (list) {
            if (!data) data = {};
            if (!data.type) data.type = name;
            var end = list.length,
                len = end - 1,
                idx, t;
            while (end--) {
                idx = lastToFirst ? end : len - end;
                t = list[idx];
                if (t.d || t.r) {
                    list.splice(idx, 1);
                    len--;
                }
                if (!t.d) SafeExec(t.f, data, me);
            }
        }
        if (remove) {
            delete me[key];
        }
    },
    /**
     * 绑定事件
     * @param {String} name 事件名称
     * @param {Function} fn 事件回调
     * @param {Interger|Boolean} insertOrRemove 事件监听插入的位置或触发后是否移除监听
     * @example
     * var T=Magix.mix({},Event);
     * T.on('done',function(e){
     *
     * });
     *
     * T.on('done',function(e){
     *
     * },0)//监听插入到开始位置
     *
     * T.on('done',function(e){
     *
     * },true)//触发后即删除该监听
     *
     * T.fire('done',{
     *     data:'test'
     * })
     */
    on: function(name, fn, insertOrRemove) {
        var key = GenKey(name);
        var list = this[key] || (this[key] = []);
        if (Magix.isNumeric(insertOrRemove)) {
            list.splice(insertOrRemove, 0, {
                f: fn
            });
        } else {
            list.push({
                f: fn,
                r: insertOrRemove
            });
        }
    },
    /**
     * 解除事件绑定
     * @param {String} name 事件名称
     * @param {Function} fn 事件回调
     */
    un: function(name, fn) {
        var key = GenKey(name),
            list = this[key];
        if (list) {
            if (fn) {
                for (var i = list.length - 1, t; i >= 0; i--) {
                    t = list[i];
                    if (t.f == fn && !t.d) {
                        t.d = 1;
                        break;
                    }
                }
            } else {
                delete this[key];
            }
        }
    }
};
    return Event;
},{
    requires:["magix/magix"]
});
/**
 * @fileOverview Vframe类
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/vframe',function(S,Magix,Event,BaseView){
    var D = document;
var VframeIdCounter = 1 << 16;
var WIN = window;
var SafeExec = Magix.safeExec;
var Slice = [].slice;
var CollectGarbage = WIN.CollectGarbage || Magix.noop;

var Mix = Magix.mix;

var TagName = Magix.config('tagName');
var RootId = Magix.config('rootId');
var IsDefaultTagName = !Magix.config('tagNameChanged');
var Has = Magix.has;
var MxView = 'mx-view';
var MxBuild = IsDefaultTagName ? 'mx-defer' : 'mx-vframe';

var Alter = 'alter';
var Created = 'created';
var RootVframe;
var GlobalAlter;

var $ = function(id) {
    return typeof id == 'object' ? id : D.getElementById(id);
};
var $$ = function(id, tag) {
    return $(id).getElementsByTagName(tag);
};
var $C = function(tag) {
    return D.createElement(tag);
};


var IdIt = function(dom) {
    return dom.id || (dom.id = 'magix_vf_' + (VframeIdCounter--));
};
var ScriptsReg = /<script[^>]*>[\s\S]*?<\/script>/ig;
var RefLoc;
/**
 * Vframe类
 * @name Vframe
 * @class
 * @constructor
 * @borrows Event.on as this.on
 * @borrows Event.fire as this.fire
 * @borrows Event.un as this.un
 * @param {String} id vframe id
 * @property {String} id vframe id
 * @property {View} view view对象
 * @property {VOM} owner VOM对象
 * @property {Boolean} viewInited view是否完成初始化，即view的inited事件有没有派发
 */
var Vframe = function(id) {
    var me = this;
    me.id = id;
    //me.vId=id+'_v';
    me.cM = {};
    me.cC = 0;
    me.rC = 0;
    me.sign = 1 << 30;
    me.rM = {};
};

Mix(Vframe, {
    /**
     * @lends Vframe
     */
    /**
     * 获取根vframe
     * @param {VOM} vom vom对象
     * @return {Vframe}
     * @private
     */
    root: function(owner, refLoc) {
        if (!RootVframe) {
            RefLoc = refLoc;
            var e = $(RootId);
            if (!e) {
                e = $C(TagName);
                e.id = RootId;
                D.body.insertBefore(e, D.body.firstChild);
            }
            RootVframe = new Vframe(RootId);
            owner.add(RootVframe);
        }
        return RootVframe;
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
                vframeViewName=pv.getAttribute(MxView);
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
            rVf.setAttribute(MxView,vframeViewName);
        }
    }
}());*/
//

Mix(Mix(Vframe.prototype, Event), {
    /**
     * @lends Vframe#
     */
    /**
     * 是否启用场景转场动画，相关的动画并未在该类中实现，如需动画，需要mxext/vfanim扩展来实现，设计为方法而不是属性可方便针对某些vframe使用动画
     * @return {Boolean}
     * @default false
     * @function
     */
    //useAnimUpdate:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，旧的view销毁时调用
     * @function
     */
    //oldViewDestroy:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，为新view准备好填充的容器
     * @function
     */
    //prepareNextView:Magix.noop,
    /**
     * 转场动画时或当view启用刷新动画时，新的view创建完成时调用
     * @function
     */
    //newViewCreated:Magix.noop,
    /**
     * 加载对应的view
     * @param {String} viewPath 形如:app/views/home?type=1&page=2 这样的名称
     * @param {Object|Null} viewInitParams view在调用init时传递的参数
     * @param {Function} callback view加载完成并触发inited事件时的回调
     */
    mountView: function(viewPath, viewInitParams, callback) {
        var me = this;
        var node = $(me.id);
        if (!node._bak) {
            node._bak = 1;
            node._tmpl = node.innerHTML.replace(ScriptsReg, '');
        } else {
            node._chgd = 1;
        }
        //var useTurnaround=me.viewInited&&me.useAnimUpdate();
        me.unmountView();
        if (viewPath) {
            var path = Magix.pathToObject(viewPath);
            var vn = path.pathname;
            var sign = --me.sign;
            Magix.libRequire(vn, function(View) {
                if (sign == me.sign) { //有可能在view载入后，vframe已经卸载了
                    var vom = me.owner;
                    BaseView.prepare(View);

                    /*var vId;
                    if(useTurnaround){
                        vId=me.vId;
                        me.prepareNextView();
                    }else{
                        vId=me.id;
                    }*/
                    var view = new View({
                        owner: me,
                        id: me.id,
                        $: $,
                        path: vn,
                        vom: vom,
                        //vId:me.vId,
                        //vfId:me.id,
                        location: RefLoc
                    });
                    me.view = view;
                    view.on('interact', function(e) { //view准备好后触发
                        /*
                            Q:为什么在interact中就进行动画，而不是在rendered之后？
                            A:可交互事件发生后，到渲染出来view的界面还是有些时间的，但这段时间可长可短，比如view所需要的数据都在内存中，则整个过程就是同步的，渲染会很快，也有可能每次数据都从服务器拉取（假设时间非常长），这时候渲染显示肯定会慢，如果到rendered后才进行动画，就会有相当长的一个时间停留在前一个view上，无法让用户感觉到程序在运行。通常这时候的另外一个解决办法是，切换到拉取时间较长的view时，这个view会整一个loading动画，也就是保证每个view及时的显示交互或状态内容，这样动画在做转场时，从上一个view转到下一个view时都会有内容，即使下一个view没内容也能及时的显示出白板页面，跟无动画时是一样的，所以这个点是最好的一个触发点
                         */
                        /*if(useTurnaround){
                            me.newViewCreated(1);
                        }
                        */
                        if (!e.tmpl) {

                            if (node._chgd) {
                                node.innerHTML = node._tmpl;
                            }

                            me.mountZoneVframes(0, 0, 1);
                        }
                        view.on('rendered', function() { //再绑定rendered
                            //
                            me.mountZoneVframes(0, 0, 1);
                        });
                        view.on('prerender', function() {
                            if (!me.unmountZoneVframes()) {
                                me.cAlter();
                            }
                        });

                        view.on('inited', function() {
                            me.viewInited = 1;
                            me.fire('viewInited', {
                                view: view
                            });
                            if (callback) {
                                SafeExec(callback, view, me);
                            }
                        });
                    }, 0);
                    viewInitParams = viewInitParams || {};
                    view.load(Mix(viewInitParams, path.params, viewInitParams));
                }
            });
        }
    },
    /**
     * 销毁对应的view
     */
    unmountView: function() {
        var me = this;
        if (me.view) {
            if (!GlobalAlter) {
                GlobalAlter = {};
            }
            me.unmountZoneVframes(); //子view中存在!autoMounted的节点
            me.cAlter(GlobalAlter);
            me.view.destroy();
            var node = $(me.id);
            if (node && node._bak) {
                node.innerHTML = node._tmpl;
            }
            /*if(useAnim&&isOutermostView){//在动画启用的情况下才调用相关接口
                me.oldViewDestroy();
            }*/
            delete me.view;
            delete me.viewInited;
            GlobalAlter = 0;
            me.fire('viewUnmounted');
            CollectGarbage();
        }
        me.sign--;
    },
    /**
     * 加载vframe
     * @param  {String} id             节点id
     * @param  {String} viewPath       view路径
     * @param  {Object} viewInitParams 传递给view init方法的参数
     * @param  {Boolean} autoMount         是否自动渲染
     * @return {Vframe} vframe对象
     * @example
     * //html
     * <div id="magix_vf_defer"></div>
     * //js
     * view.owner.mountVframe('magix_vf_defer','app/views/list',{page:2})
     * //注意：动态向某个节点渲染view时，该节点无须是vframe标签
     */
    mountVframe: function(id, viewPath, viewInitParams, autoMount) {
        var me = this;
        var vom = me.owner;
        var vf = vom.get(id);
        if (!vf) {
            vf = new Vframe(id);

            vf.pId = me.id;

            if (!Has(me.cM, id)) {
                me.cC++;
            }
            me.cM[id] = autoMount;
            vom.add(vf);
        }
        vf.mountView(viewPath, viewInitParams);
        return vf;
    },
    /**
     * 加载当前view下面的子view，因为view的持有对象是vframe，所以是加载vframes
     * @param {zoneId} HTMLElement|String 节点对象或id
     */
    mountZoneVframes: function(zoneId, viewInitParams, autoMount) {
        var me = this;
        //var owner=me.owner;
        var node = zoneId || me.id;
        me.unmountZoneVframes(node);
        /* if(!zoneId){
            node=me.id;
        }else{
            node=zoneId;
        }*/
        var vframes = $$(node, TagName);
        var count = vframes.length;
        var subs = {};
        if (count) {
            for (var i = 0, vframe, key, mxView, mxBuild; i < count; i++) {
                vframe = vframes[i];

                key = IdIt(vframe);
                if (!Has(subs, key)) {
                    mxView = vframe.getAttribute(MxView);
                    mxBuild = !vframe.getAttribute(MxBuild);
                    mxBuild = mxBuild == IsDefaultTagName;
                    if (mxBuild || mxView) {
                        me.mountVframe(key, mxView, viewInitParams, autoMount);
                        var svs = $$(vframe, TagName);
                        for (var j = 0, c = svs.length, temp; j < c; j++) {
                            temp = svs[j];
                            mxView = temp.getAttribute(MxView);
                            mxBuild = !temp.getAttribute(MxBuild);
                            mxBuild = mxBuild == IsDefaultTagName;
                            if (!mxBuild && !mxView) {
                                subs[IdIt(temp)] = 1;
                            }
                        }
                    }
                }
            }
        }
        if (me.cC == me.rC) { //有可能在渲染某个vframe时，里面有n个vframes，但立即调用了mountZoneVframes，这个下面没有vframes，所以要等待
            me.cCreated({});
        }
    },
    /**
     * 销毁vframe
     * @param  {String} [id]      节点id
     */
    unmountVframe: function(id) {
        var me = this;
        id = id || me.id;
        var vom = me.owner;
        var vf = vom.get(id);
        if (vf) {
            var cc = vf.fcc;
            vf.unmountView();
            vom.remove(id, cc);
            me.fire('destroy');
            var p = vom.get(vf.pId);
            if (p && Has(p.cM, id)) {
                delete p.cM[id];
                p.cC--;
            }
        }
    },
    /**
     * 销毁某个区域下面的所有子vframes
     * @param {HTMLElement|String} [zoneId]节点对象或id
     */
    unmountZoneVframes: function(zoneId) {
        var me = this;
        var children;
        var hasVframe;
        if (zoneId) {
            children = $$(zoneId, TagName);
            var ids = {}, cs = me.cM;
            for (var i = children.length - 1, o; i >= 0; i--) {
                o = children[i].id;
                if (Has(cs, o)) {
                    ids[o] = 1;
                }
            }
            children = ids;
        } else {
            children = me.cM;
        }
        for (var p in children) {
            hasVframe = true;
            me.unmountVframe(p);
        }
        return hasVframe;
    },
    /**
     * 调用view中的方法
     * @param  {String} methodName 方法名
     * @param {Object} [args1,args2] 向方法传递的参数
     * @return {Object}
     */
    invokeView: function(methodName) {
        var me = this;
        var view = me.view;
        var args = Slice.call(arguments, 1);
        var r;
        if (me.viewInited && view[methodName]) {
            r = SafeExec(view[methodName], args, view);
        }
        return r;
    },
    /**
     * 通知所有的子view创建完成
     * @private
     */
    cCreated: function(e) {
        var me = this;
        var view = me.view;
        if (view && !me.fcc) {
            me.fcc = 1;
            delete me.fca;
            view.fire(Created, e);
            me.fire(Created, e);
        }
        var vom = me.owner;
        vom.vfCreated();

        var mId = me.id;
        var p = vom.get(me.pId);
        if (p && !Has(p.rM, mId)) {

            p.rM[mId] = p.cM[mId];
            p.rC++;

            if (p.rC == p.cC) {
                p.cCreated(e);
            }
        }
    },
    /**
     * 通知子vframe有变化
     * @private
     */
    cAlter: function(e) {
        var me = this;
        if (!e) e = {};
        delete me.fcc;
        if (!me.fca) {
            var view = me.view;
            var mId = me.id;
            if (view) {
                me.fca = 1;
                view.fire(Alter, e);
                me.fire(Alter, e);
            }
            var vom = me.owner;
            var p = vom.get(me.pId);


            if (p && Has(p.rM, mId)) {
                var autoMount = p.rM[mId];
                p.rC--;
                delete p.rM[mId];
                if (autoMount) {
                    p.cAlter(e);
                }
            }
        }
    },
    /**
     * 通知当前vframe，地址栏发生变化
     * @param {Object} loc window.location.href解析出来的对象
     * @param {Object} chged 包含有哪些变化的对象
     * @private
     */
    locChged: function(loc, chged) {
        var me = this;
        var view = me.view;
        /*
            重点：
                所有手动mountView的都应该在合适的地方中断消息传递：
            示例：
                <div id="magix_vf_root">
                    <vframe mx-view="app/views/leftmenus" id="magix_vf_lm"></vframe>
                    <vframe id="magix_vf_main"></vframe>
                </div>
            默认view中自动渲染左侧菜单，右侧手动渲染

            考虑右侧vframe嵌套并且缓存的情况下，如果未中断消息传递，有可能造成新渲染的view接收到消息后不能做出正确反映，当然左侧菜单是不需要中断的，此时我们在locationChange中
              return ["magix_vf_lm"];

            假设右侧要这样渲染：
                <vframe mx-view="app/views/home/a" id="vf1"></vframe>

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
        if (view && view.sign) {
            //view.location=loc;
            if (view.rendered) { //存在view时才进行广播，对于加载中的可在加载完成后通过调用view.location拿到对应的window.location.href对象，对于销毁的也不需要广播
                var isChanged = view.olChanged(chged);
                /**
                 * 事件对象
                 * @type {Object}
                 */
                var args = {
                    location: loc,
                    changed: chged,
                    /**
                     * 阻止向所有的子view传递
                     */
                    prevent: function() {
                        this.cs = [];
                    },
                    /**
                     * 向特定的子view传递
                     * @param  {Array} c 子view数组
                     */
                    toChildren: function(c) {
                        c = c || [];
                        if (Magix.isString(c)) {
                            c = c.split(',');
                        }
                        this.cs = c;
                    }
                };
                if (isChanged) { //检测view所关注的相应的参数是否发生了变化
                    //safeExec(view.render,[],view);//如果关注的参数有变化，默认调用render方法
                    //否定了这个想法，有时关注的参数有变化，不一定需要调用render方法
                    SafeExec(view.locationChange, args, view);
                }
                var cs = args.cs || Magix.keys(me.cM);
                //
                for (var i = 0, j = cs.length, vom = me.owner, vf; i < j; i++) {
                    vf = vom.get(cs[i]);
                    if (vf) {
                        vf.locChged(loc, chged);
                    }
                }
            }
        }
    }
    /**
     * 向当前vframe发送消息
     * @param {Object} args 消息对象
     */
    /*message:function(args){
        var me=this;
        var view=me.view;
        if(view&&me.vced){*/
    //表明属于vframe的view对象已经加载完成
    /*
                考虑
                <vframe id="v1" mx-view="..."></vframe>
                <vframe id="v2" mx-view="..."></vframe>
                <vframe id="v3" mx-view="..."></vframe>

                v1渲染后postMessage向v2 v3发消息，此时v2 v3的view对象是构建好了，但它对应的模板可能并未就绪，需要等待到view创建完成后再发消息过去
             */
    //if(view.rendered){
    //safeExec(view.receiveMessage,args,view);
    /*}else{ //使用ViewLoad
                view.on('created',function(){
                    safeExec(this.receiveMessage,args,this);
                });
            }   */
    //}else{//经过上面的判断，到这一步说明开始加载view但尚未加载完成
    /*
                Q:当vframe没有view属性但有viewName表明属于这个vframe的view异步加载尚未完成，但为什么还要向这个view发送消息呢，丢弃不可以吗？

                A:考虑这样的情况，页面上有A B两个view，A在拿到数据完成渲染后会向B发送一个消息，B收到消息后才渲染。在加载A B两个view时，是同时加载的，这两个加载是异步，A在加载、渲染完成向B发送消息时，B view对应的js文件很有可能尚未载入完成，所以这个消息会由B vframe先持有，等B对应的view载入后再传递这个消息过去。如果不传递这个消息则Bview无法完成后续的渲染。vframe是通过对内容分析立即就构建出来的，view是对应的js加载完成才存在的，因异步的存在，所以需要这样的处理。
             */
    /*
            me.on(ViewLoad,function(e){
                safeExec(e.view.receiveMessage,args,e.view);
            });
        }
    }*/
    /**
     * view初始化完成后触发，由于vframe可以渲染不同的view，也就是可以通过mountView来渲染其它view，所以viewInited可能触发多次
     * @name Vframe#viewInited
     * @event
     * @param {Object} e
     */

    /**
     * view卸载时触发，由于vframe可以渲染不同的view，因此该事件可能被触发多次
     * @name Vframe#viewUnmounted
     * @event
     */

    /**
     * 子孙view修改时触发
     * @name Vframe#alter
     * @event
     * @param {Object} e
     */

    /**
     * 子孙view创建完成时触发
     * @name Vframe#created
     * @event
     * @param {Object} e
     */

    /**
     * vframe销毁时触发
     * @name Vframe#destroy
     * @event
     */
});

/**
 * Vframe 中的2条线
 * 一：
 *     渲染
 *     每个Vframe有cC(childrenCount)属性和cM(childrenItems)属性
 *
 * 二：
 *     修改与创建完成
 *     每个Vframe有rC(readyCount)属性和rM(readyMap)属性
 *
 *      fca firstChildrenAlter  fcc firstChildrenCreated
 */
    return Vframe;
},{
    requires:["magix/magix","magix/event","magix/view"]
});
/**
 * @fileOverview view类
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/view', function(S, Magix, Event, Body, IO) {

    var SafeExec = Magix.safeExec;
var Has = Magix.has;
var COMMA = ',';
var EMPTY_ARRAY = [];

var Mix = Magix.mix;
var WrapAsynUpdateNames = ['render', 'renderUI'];
var WrapKey = '~';
var WrapFn = function(fn) {
    return function() {
        var me = this;
        var r;
        var u = me.notifyUpdate();
        if (u) {
            r = fn.apply(me, arguments);
        }
        return r;
    };
};

var EvtInfoCache = Magix.cache(40);
var CollectGarbage = window.CollectGarbage || Magix.noop;
//var MxEvent=/<(\w+)([\s\S]+?mx-[^ohv][a-z]+\s*=\s*"[^"]")/g;
var MxEvent = /<[a-z]+(?:[^">]|"[^"]*")+(?=>)/g;
var MxOwner = /\smx-owner\s*=/;
var MxEvt = /\smx-[^v][a-z]+\s*=/;
var MxEFun = function(m) {
    return !MxOwner.test(m) && MxEvt.test(m) ? m + ' mx-owner="' + MxEFun.t + '"' : m;
};
var WEvent = {
    prevent: function(e) {
        e = e || this.domEvent;
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    },
    stop: function(e) {
        e = e || this.domEvent;
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    },
    halt: function(e) {
        this.prevent(e);
        this.stop(e);
    }
};
var EvtInfoReg = /(\w+)(?:<(\w+)>)?(?:{([\s\S]*)})?/;
var EvtParamsReg = /(\w+):([^,]+)/g;
/**
 * View类
 * @name View
 * @class
 * @constructor
 * @borrows Event.on as this.on
 * @borrows Event.fire as this.fire
 * @borrows Event.un as this.un
 * @param {Object} ops 创建view时，需要附加到view对象上的其它属性
 * @property {Object} events 事件对象
 * @property {String} id 当前view与页面vframe节点对应的id
 * @property {Vframe} owner 拥有当前view的vframe对象
 * @property {Object} vom vom对象
 * @property {Integer} sign view的签名，用于刷新，销毁等的异步标识判断
 * @property {String} template 当前view对应的模板字符串(当hasTmpl为true时)，该属性在primed事件触发后才存在
 * @property {Boolean} rendered 标识当前view有没有渲染过，即primed事件有没有触发过
 * @property {Object} location window.locaiton.href解析出来的对象
 * @example
 * 关于View.prototype.events:
 * 示例：
 *   html写法：
 *
 *   &lt;input type="button" mx-click="test{id:100,name:xinglie}" value="test" /&gt;
 *   &lt;a href="http://etao.com" mx-click="test&lt;prevent&gt;{com:etao.com}"&gt;http://etao.com&lt;/a&gt;
 *
 *   view写法：
 *
 *   events:{
 *      click:{
 *          test:function(e){
 *              //e.view  当前view对象
 *              //e.currentId 处理事件的dom节点id(即带有mx-click属性的节点)
 *              //e.targetId 触发事件的dom节点id(即鼠标点中的节点，在currentId里包含其它节点时，currentId与targetId有可能不一样)
 *              //e.events  view.events对象，可访问其它事件对象，如：e.events.mousedown.test
 *              //e.params  传递的参数
 *              //e.params.com,e.params.id,e.params.name
 *          }
 *      },
 *      mousedown:{
 *          test:function(e){
 *
 *          }
 *      }
 *   }
 */


var View = function(ops) {
    var me = this;
    Mix(me, ops);
    me.sign = 1; //标识view是否刷新过，对于托管的函数资源，在回调这个函数时，不但要确保view没有销毁，而且要确保view没有刷新过，如果刷新过则不回调
};

Mix(View, {
    /**
     * @lends View
     */
    /**
     * 对异步更新view的方法进行一次包装
     * @private
     */
    wrapUpdate: function() {
        var view = this;
        if (!view[WrapKey]) { //只处理一次
            view[WrapKey] = 1;
            var prop = view.prototype;
            var old;
            for (var p = WrapAsynUpdateNames.length - 1, name; p > -1; p--) {
                name = WrapAsynUpdateNames[p];
                old = prop[name];
                if (Magix.isFunction(old) && old != Magix.noop) {
                    prop[name] = WrapFn(old);
                }
            }
        }
    }
});

Mix(Mix(View.prototype, Event), {
    /**
     * @lends View#
     */
    /**
     * 使用xhr获取当前view对应的模板内容，仅在开发app阶段时使用，打包上线后html与js打包在一起，不会调用这个方法
     * @function
     * @param {String} path 路径
     * @param {Function} fn 获取完成后的回调
     * @private
     */
    
    /**
     * 渲染view，供最终view开发者覆盖
     * @function
     */
    render: Magix.noop,
    /**
     * 当window.location.href有变化时调用该方法（如果您通过observeLocation指定了相关参数，则这些相关参数有变化时才调用locationChange，否则不会调用），供最终的view开发人员进行覆盖
     * @function
     * @param {Object} e 事件对象
     * @param {Object} e.location window.location.href解析出来的对象
     * @param {Object} e.changed 包含有哪些变化的对象
     * @param {Function} e.prevent 阻止向所有子view传递locationChange的消息
     * @param {Function} e.toChildren 向特定的子view传递locationChange的消息
     * @example
     * //example1
     * locationChange:function(e){
     *     if(e.changed.isPathname()){//pathname的改变
     *         //...
     *         e.prevent();//阻止向所有子view传递改变的消息
     *     }
     * }
     *
     * //example2
     * locationChange:function(e){
     *     if(e.changed.isParam('menu')){//menu参数发生改变
     *         e.toChildren('magix_vf_menus');//只向id为 magix_vf_menus的view传递这个消息
     *     }
     * }
     *
     * //example3
     * //当不调用e.prevent或e.toChildren，则向所有子view传递消息
     * locationChange:function(e){
     *     //...
     * }
     */
    locationChange: Magix.noop,
    /**
     * 初始化方法，供最终的view开发人员进行覆盖
     * @param {Object} extra 初始化时，外部传递的参数
     * @function
     */
    init: Magix.noop,
    /**
     * 标识当前view是否有模板文件
     * @default true
     */
    hasTmpl: true,
    /**
     * 是否启用DOM事件(events对象指定的事件是否生效)
     * @default true
     * @example
     * 该属性在做浏览器兼容时有用：支持pushState的浏览器阻止a标签的默认行为，转用pushState，不支持时直接a标签跳转，view不启用事件
     * Q:为什么不支持history state的浏览器上还要使用view？
     * A:考虑 http://etao.com/list?page=2#!/list?page=3; 在IE6上，实际的页码是3，但后台生成时候生成的页码是2，<br />所以需要magix/view载入后对相应的a标签链接进行处理成实际的3。用户点击链接时，由于view没启用事件，不会阻止a标签的默认行为，后续才是正确的结果
     */
    enableEvent: true,
    /**
     * view刷新时是否采用动画
     * @type {Boolean}
     */
    //enableAnim:false,
    /**
     * 加载view内容
     * @private
     */
    load: function() {
        var me = this;
        var hasTmpl = me.hasTmpl;
        var args = arguments;
        var sign = me.sign;
        var tmplReady = Has(me, 'template');
        var ready = function(tmpl) {
            if (sign == me.sign) {
                if (!tmplReady) {
                    me.template = me.wrapMxEvent(tmpl);
                }
                me.delegateEvents();
                /*
                    关于interact事件的设计 ：
                    首先这个事件是对内的，当然外部也可以用，API文档上就不再体现了

                    interact : view准备好，让外部尽早介入，进行其它事件的监听 ，当这个事件触发时，view有可能已经有html了(无模板的情况)，所以此时外部可以去加载相应的子view了，同时要考虑在调用render方法后，有可能在该方法内通过setViewHTML更新html，所以在使用setViewHTML更新界面前，一定要先监听prerender rendered事件，因此设计了该  interact事件

                 */
                me.fire('interact', {
                    tmpl: hasTmpl
                }, 1); //可交互
                SafeExec(me.init, args, me);
                me.fire('inited', 0, 1);
                SafeExec(me.render, EMPTY_ARRAY, me);
                //
                var noTemplateAndNoRendered = !hasTmpl && !me.rendered; //没模板，调用render后，render里面也没调用setViewHTML

                if (noTemplateAndNoRendered) { //监视有没有在调用render方法内更新view，对于没有模板的view，需要派发一次事件
                    me.rendered = true;
                    me.fire('primed', null, 1); //primed事件只触发一次
                }
            }
        };
        if (hasTmpl && !tmplReady) {
            me.fetchTmpl(ready);
        } else {
            ready();
        }
    },
    /**
     * 通知当前view即将开始进行html的更新
     */
    beginUpdate: function() {
        var me = this;
        if (me.sign && me.rendered) {
            me.fire('refresh', 0, 1);
            me.fire('prerender');
        }
    },
    /**
     * 通知当前view结束html的更新
     */
    endUpdate: function() {
        var me = this;
        if (me.sign) {
            /*if(me.rendered&&me.enableAnim){
                var owner=me.owner;
                SafeExec(owner.newViewCreated,EMPTY_ARRAY,owner);
            }*/
            if (!me.rendered) { //触发一次primed事件
                me.fire('primed', 0, 1);
            }
            me.rendered = true;
            me.fire('rendered'); //可以在rendered事件中访问view.rendered属性
            CollectGarbage();
        }
    },
    /**
     * 通知当前view进行更新，与beginUpdate不同的是：begin是开始更新html，notify是开始调用更新的方法，通常render与renderUI已经自动做了处理，对于用户自定义的获取数据并更新界面时，在开始更新前，需要调用一下该方法
     * @return {Integer} 当前view的签名
     */
    notifyUpdate: function() {
        var me = this;
        if (me.sign) {
            me.sign++;
            me.fire('rendercall');
        }
        return me.sign;
    },
    /**
     * 包装mx-event，自动添加mx-owner属性
     * @param {String} html html字符串
     */
    wrapMxEvent: function(html) {
        MxEFun.t = this.id;
        return String(html).replace(MxEvent, MxEFun);
    },
    /**
     * 设置view的html内容
     * @param {Strig} html html字符串
     * @example
     * render:function(){
     *     this.setViewHTML(this.template);//渲染界面，当界面复杂时，请考虑用其它方案进行更新
     * }
     */
    /*
        1.首次调用：
            setNodeHTML -> delegate unbubble events -> rendered(事件) -> primed(事件)

        2.再次调用
            refresh(事件) -> prerender(事件) -> undelegate unbubble events -> anim... -> setNodeHTML -> delegate unbubble events -> rendered(事件)

        当prerender、rendered事件触发时，在vframe中

        prerender : unloadSubVframes

        rendered : loadSubVframes
     */
    setViewHTML: function(html) {
        var me = this,
            n;
        me.beginUpdate();
        if (me.sign) {
            n = me.$(me.id);
            if (n) n.innerHTML = html;
        }
        me.endUpdate();
    },
    /**
     * 指定要监视地址栏中的哪些值有变化时，或pathname有变化时，当前view的locationChange才会被调用。通常情况下location有变化就会引起当前view的locationChange被调用，但这会带来一些不必要的麻烦，所以你可以指定地址栏中哪些值有变化时才引起locationChange调用，使得view只关注与自已需要刷新有关的参数
     * @param {Array|String|Object} args  数组字符串或对象
     * @example
     * return View.extend({
     *      init:function(){
     *          this.observeLocation('page,rows');//关注地址栏中的page rows2个参数的变化，当其中的任意一个改变时，才引起当前view的locationChange被调用
     *          this.observeLocation({
     *              pathname:true//关注pathname的变化
     *          });
     *          //也可以写成下面的形式
     *          //this.observeLocation({
     *          //    keys:['page','rows'],
     *          //    pathname:true
     *          //})
     *      },
     *      locationChange:function(e){
     *          if(e.changed.isParam('page')){};//检测是否是page发生的改变
     *          if(e.changed.isParam('rows')){};//检测是否是rows发生的改变
     *      }
     * });
     */
    observeLocation: function(args) {
        var me = this,
            loc;
        if (!me.$ol) me.$ol = {
            keys: []
        };
        loc = me.$ol;
        var keys = loc.keys;
        if (Magix.isObject(args)) {
            loc.pn = args.pathname;
            args = args.keys;
        }
        if (args) {
            loc.keys = keys.concat(String(args).split(COMMA));
        }
    },
    /**
     * 指定监控地址栏中pathname的改变
     * @example
     * return View.extend({
     *      init:function(){
     *          this.observePathname();//关注地址栏中pathname的改变，pathname改变才引起当前view的locationChange被调用
     *      },
     *      locationChange:function(e){
     *          if(e.changed.isPathname()){};//是否是pathname发生的改变
     *      }
     * });
     */
    /*observePathname:function(){
        var me=this;
        if(!me.$loc)me.$loc={};
        me.$loc.pn=true;
    },*/
    /**
     * 指定要监视地址栏中的哪些值有变化时，当前view的locationChange才会被调用。通常情况下location有变化就会引起当前view的locationChange被调用，但这会带来一些不必要的麻烦，所以你可以指定地址栏中哪些值有变化时才引起locationChange调用，使得view只关注与自已需要刷新有关的参数
     * @param {Array|String} keys            key数组或字符串
     * @param {Boolean} observePathname 是否监视pathname
     * @example
     * return View.extend({
     *      init:function(){
     *          this.observeParams('page,rows');//关注地址栏中的page rows2个参数的变化，当其中的任意一个改变时，才引起当前view的locationChange被调用
     *      },
     *      locationChange:function(e){
     *          if(e.changed.isParam('page')){};//检测是否是page发生的改变
     *          if(e.changed.isParam('rows')){};//检测是否是rows发生的改变
     *      }
     * });
     */
    /*observeParams:function(keys){
        var me=this;
        if(!me.$loc)me.$loc={};
        me.$loc.keys=Magix.isArray(keys)?keys:String(keys).split(COMMA);
    },*/
    /**
     * 检测通过observeLocation方法指定的key对应的值有没有发生变化
     * @param {Object} changed 对象
     * @return {Boolean} 是否发生改变
     * @private
     */
    olChanged: function(changed) {
        var me = this;
        var location = me.$ol;
        if (location) {
            var res = 0;
            if (location.pn) {
                res = changed.isPathname();
            }
            if (!res) {
                var keys = location.keys;
                res = changed.isParam(keys);
            }
            return res;
        }
        return 1;
    },

    /**
     * 销毁当前view
     * @private
     */
    destroy: function() {
        var me = this;
        //me.fire('refresh',null,true,true);//先清除绑定在上面的app中的刷新
        me.fire('refresh', 0, 1);
        me.fire('destroy', 0, 1, 1); //同上

        me.delegateEvents(1);
        //if(!keepContent){
        //me.destroyFrames();
        //var node=$(me.vfId);
        //if(node._dataBak){
        //node.innerHTML=node._dataTmpl;
        //}
        //}

        //me.un('prerender',null,true); 销毁的话也就访问不到view对象了，这些事件不解绑也没问题
        //me.un('rendered',null,true);
        me.sign = 0;
        //
    },
    /**
     * 获取渲染当前view的父view
     * @return {View}
     */
    parentView: function() {
        var me = this,
            vom = me.vom,
            owner = me.owner;
        var pVframe = vom.get(owner.pId),
            r = null;
        if (pVframe && pVframe.viewInited) {
            r = pVframe.view;
        }
        return r;
    },
    /**
     * 处理dom事件
     * @param {Event} e dom事件对象
     * @private
     */
    processEvent: function(e) {
        var me = this;
        if (me.enableEvent && me.sign) {
            var info = e.info;
            var domEvent = e.se;

            var m = EvtInfoCache.get(info);

            if (!m) {
                m = info.match(EvtInfoReg);
                m = {
                    n: m[1],
                    f: m[2],
                    i: m[3],
                    p: {}
                };
                if (m.i) {
                    m.i.replace(EvtParamsReg, function(x, a, b) {
                        m.p[a] = b;
                    });
                }
                EvtInfoCache.set(info, m);
            }
            var events = me.events;
            if (events) {
                var eventsType = events[domEvent.type];
                var fn = WEvent[m.f];
                if (fn) {
                    fn.call(WEvent, domEvent);
                }
                fn = eventsType && eventsType[m.n];
                if (fn) {
                    SafeExec(fn, Mix({
                        view: me,
                        currentId: e.cId,
                        targetId: e.tId,
                        domEvent: domEvent,
                        events: events,
                        params: m.p
                    }, WEvent), eventsType);
                }
            }
        }
    },
    /**
     * 处理代理事件
     * @param {Boolean} bubble  是否冒泡的事件
     * @param {Boolean} dispose 是否销毁
     * @private
     */
    delegateEvents: function(destroy) {
        var me = this;
        var events = me.events;
        var fn = destroy ? Body.un : Body.on;
        var vom = me.vom;
        for (var p in events) {
            fn.call(Body, p, vom);
        }
    }
    /**
     * 当您采用setViewHTML方法异步更新html时，通知view做好异步更新的准备，<b>注意:该方法最好和manage，setViewHTML一起使用。当您采用其它方式异步更新整个view的html时，仍需调用该方法</b>，建议对所有的异步更新回调使用manage方法托管，对更新整个view html前，调用beginAsyncUpdate进行更新通知
     * @example
     * // 什么是异步更新html？
     * render:function(){
     *      var _self=this;
     *      var m=new Model({uri:'user:list'});
     *      m.load({
     *          success:_self.manage(function(data){
     *              var html=Mu.to_html(_self.template,data);
     *              _self.setViewHTML(html);
     *          }),
     *          error:_self.manage(function(msg){
     *              _self.setViewHTML(msg);
     *          })
     *      })
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
     *  render:function(){
     *      var _self=this;
     *      _self.beginAsyncUpdate();//开始异步更新
     *      var m=new Model({uri:'user:list'});
     *      m.load({
     *          success:_self.manage(function(data){
     *              var html=Mu.to_html(_self.template,data);
     *              _self.setViewHTML(html);
     *          }),
     *          error:_self.manage(function(msg){
     *              _self.setViewHTML(msg);
     *          })
     *      });
     *      _self.endAsyncUpdate();//结束异步更新
     * }
     * //其中endAsyncUpdate是备用的，把你的异步更新的代码放begin end之间即可
     * //当然如果在每个异步更新的都需要这样写的话来带来差劲的编码体验，所以View会对render,renderUI,updateUI三个方法自动进行异步更新包装
     * //您在使用这三个方法异步更新html时无须调用beginAsyncUpdate和endAsyncUpdate方法
     * //如果除了这三个方法外你还要添加其它的异步更新方法，可调用View静态方法View.registerAsyncUpdateName来注册自已的方法
     * //请优先考虑使用render renderUI updateUI 这三个方法来实现view的html更新，其中render方法magix会自动调用，您就考虑后2个方法吧
     * //比如这样：
     *
     * renderUI:function(){//当方法名为 render renderUI updateUI时您不需要考虑异步更新带来的问题
     *      var _self=this;
     *      setTimeout(this.manage(function(){
     *          _self.setViewHTML(_self.template);
     *      }),5000);
     * },
     *
     * receiveMessage:function(e){
     *      if(e.action=='render'){
     *          this.renderUI();
     *      }
     * }
     *
     * //当您需要自定义异步更新方法时，可以这样：
     * KISSY.add("app/views/list",function(S,MxView){
     *      var ListView=MxView.extend({
     *          updateHTMLByXHR:function(){
     *              var _self=this;
     *              S.io({
     *                  success:_self.manage(function(html){
     *                      //TODO
     *                      _self.setViewHTML(html);
     *                  })
     *              });
     *          },
     *          receiveMessage:function(e){
     *              if(e.action=='update'){
     *                  this.updateHTMLByXHR();
     *              }
     *          }
     *      });
     *      ListView.registerAsyncUpdateName('updateHTMLByXHR');//注册异步更新html的方法名
     *      return ListView;
     * },{
     *      requires:["magix/view"]
     * })
     * //当您不想托管回调方法，又想消除异步更新带来的隐患时，可以这样：
     *
     * updateHTML:function(){
     *      var _self=this;
     *      var begin=_self.beginAsyncUpdate();//记录异步更新标识
     *      S.io({
     *          success:function(html){
     *              //if(_self.sign){//不托管方法时，您需要自已判断view有没有销毁(使用异步更新标识时，不需要判断exist)
     *                  var end=_self.endAsyncUpdate();//结束异步更新
     *                  if(begin==end){//开始和结束时的标识一样，表示view没有更新过
     *                      _self.setViewHTML(html);
     *                  }
     *              //}
     *          }
     *      });
     * }
     *
     * //顺带说一下signature
     * //并不是所有的异步更新都需要托管，考虑这样的情况：
     *
     * render:function(){
     *      ModelFactory.fetchAll({
     *          type:'User_List',
     *          cacheKey:'User_List'
     *      },function(m){
     *          //render
     *      });
     * },
     * //...
     * click:{
     *      addUser:function(e){
     *          var m=ModelFactory.getIf('User_List');
     *          var userList=m.get("userList");
     *          m.beginTransaction();
     *          userList.push({
     *              id:'xinglie',
     *              name:'xl'
     *          });
     *
     *          m.save({
     *              success:function(){//该回调不太适合托管
     *                  m.endTransaction();
     *                  Helper.tipMsg('添加成功')
     *              },
     *              error:function(msg){//该方法同样不适合托管，当数据保存失败时，需要回滚数据，而如果此时view有刷新或销毁，会导致该方法不被调用，无法达到数据的回滚
     *                  m.rollbackTransaction();
     *                  Helper.tipMsg('添加失败')
     *              }
     *          })
     *
     *      }
     * }
     *
     * //以上click中的方法这样写较合适：
     *
     * click:{
     *      addUser:function(e){
     *          var m=ModelFactory.getIf('User_List');
     *          var userList=m.get("userList");
     *          m.beginTransaction();
     *          userList.push({
     *              id:'xinglie',
     *              name:'xl'
     *          });
     *
     *          var sign=e.view.signature();//获取签名
     *
     *          m.save({
     *              success:function(){//该回调不太适合托管
     *                  m.endTransaction();
     *                  if(sign==e.view.signature()){//相等时表示view即没刷新也没销毁，此时才提示
     *                      Helper.tipMsg('添加成功')
     *                  }
     *              },
     *              error:function(msg){//该方法同样不适合托管，当数据保存失败时，需要回滚数据，而如果此时view有刷新或销毁，会导致该方法不被调用，无法达到数据的回滚
     *                  m.rollbackTransaction();
     *                  if(sign==e.view.signature()){//view即没刷新也没销毁
     *                      Helper.tipMsg('添加失败')
     *                  }
     *              }
     *          })
     *
     *      }
     * }
     *
     * //如果您无法识别哪些需要托管，哪些需要签名，统一使用托管方法就好了
     */
    /*beginAsyncUpdate:function(){
        return this.sign++;//更新sign
    },*/
    /**
     * 获取view在当前状态下的签名，view在刷新或销毁时，均会更新签名。(通过签名可识别view有没有搞过什么动作)
     */
    /*    signature:function(){
        return this.sign;
    },*/
    /**
     * 通知view结束异步更新html
     * @see View#beginAsyncUpdate
     */
    /*endAsyncUpdate:function(){
        return this.sign;
    },*/
    /**
     * 当view调用setViewHTML刷新前触发
     * @name View#prerender
     * @event
     * @param {Object} e
     */

    /**
     * 当view首次完成界面的html设置后触发，view有没有模板均会触发该事件，对于有模板的view，会等到模板取回，第一次调用setViewHTML更新界面后才触发，总之该事件触发后，您就可以访问view的HTML DOM节点对象（该事件仅代表自身的html创建完成，如果需要对整个子view也要监控，请使用created事件）
     * @name View#primed
     * @event
     * @param {Object} e view首次调用render完成界面的创建后触发
     */

    /**
     * 每次调用setViewHTML更新view内容完成后触发
     * @name View#rendered
     * @event
     * @param {Object} e view每次调用setViewHTML完成后触发，当hasTmpl属性为false时，并不会触发该事 件，但会触发primed首次完成创建界面的事件
     */

    /**
     * view销毁时触发
     * @name View#destroy
     * @event
     * @param {Object} e
     */

    /**
     * view调用init方法后触发
     * @name View#inited
     * @event
     * @param {Object} e
     */

    /**
     * view自身和所有子孙view创建完成后触发，常用于要在某个view中统一绑定事件或统一做字段校验，而这个view是由许多子孙view组成的，通过监听该事件可知道子孙view什么时间创建完成（注意：当view中有子view，且该子view是通过程序动态mountView而不是通过mx-view指定时，该事件会也会等待到view创建完成触发，而对于您在某个view中有如下代码：<div><vframe></vframe></div>，有一个空的vframe且未指定mx-view属性，同时您在这个view中没有动态渲染vframe对应的view，则该事件不会触发，magix无法识别出您留空vframe的意图，到底是需要动态mount还是手误，不过在具体应用中，出现空vframe且没有动态mount几乎是不存在的^_^）
     * @name View#created
     * @event
     * @param {Object} e
     * @example
     * init:function(){
     *      this.on('created',function(){
     *          //
     *      })
     * }
     */

    /**
     * view自身和所有子孙view有改动时触发，改动包括刷新和重新mountView，与created一起使用，当view自身和所有子孙view创建完成会触发created，当其中的一个view刷新或重新mountView，会触发childrenAlter，当是刷新时，刷新完成会再次触发created事件，因此这2个事件不只触发一次！！但这2个事件会成对触发，比如触发几次childrenAlter就会触发几次created
     * @name View#alter
     * @event
     * @param {Object} e
     */

    /**
     * 异步更新ui的方法(render,renderUI)被调用前触发
     * @name View#rendercall
     * @event
     * @param {Object} e
     */


    /**
     * 每次调用beginUpdate更新view内容前触发
     * @name View#refresh
     * @event
     * @param {Object} e
     * 与prerender不同的是：refresh触发后即删除监听列表
     */
});
    var AppHome = Magix.config('appHome');
    var Suffix = Magix.config('debug') ? '?t=' + S.now() : '';

    var ProcessObject = function(props, proto, enterObject) {
        for (var p in proto) {
            if (S.isObject(proto[p])) {
                if (!Has(props, p)) props[p] = {};
                ProcessObject(props[p], proto[p], 1);
            } else if (enterObject) {
                props[p] = proto[p];
            }
        }
    };


    View.prototype.fetchTmpl = function(fn) {
        var me = this;
        var hasTemplate = 'template' in me;
        if (!hasTemplate) {
            var i = Magix.tmpl(me.path);
            if (i.h) {
                fn(i.v);
            } else {
                var file = AppHome + me.path + '.html';
                var l = ProcessObject[file];
                var onload = function(tmpl) {
                    fn(Magix.tmpl(me.path, tmpl));
                };
                if (l) {
                    l.push(onload);
                } else {
                    l = ProcessObject[file] = [onload];
                    IO({
                        url: file + Suffix,
                        success: function(x) {
                            SafeExec(l, x);
                            delete ProcessObject[file];
                        },
                        error: function(e, m) {
                            SafeExec(l, m);
                            delete ProcessObject[file];
                        }
                    });
                }
            }
        } else {
            fn(me.template);
        }
    };

    View.extend = function(props, ctor, statics) {
        var me = this;
        var BaseView = function() {
            BaseView.superclass.constructor.apply(this, arguments);
            if (ctor) {
                SafeExec(ctor, arguments, this);
            }
        }
        BaseView.extend = me.extend;
        return S.extend(BaseView, me, props, statics);
    };
    View.prepare = function(oView) {
        var me = this;
        if (!oView.wrapUpdate) {
            oView.wrapUpdate = me.wrapUpdate;
            oView.extend = me.extend;

            var aimObject = oView.prototype;
            var start = oView.superclass;
            var temp;
            while (start) {
                temp = start.constructor;
                ProcessObject(aimObject, temp.prototype);
                start = temp.superclass;
            }
        }
        oView.wrapUpdate();
    };
    return View;
}, {
    requires: ["magix/magix", "magix/event", "magix/body", "ajax"]
});
/**
 * @fileOverview VOM
 * @author 行列
 * @version 1.0
 */
KISSY.add("magix/vom",function(S,Vframe,Magix,Event){
    var Has = Magix.has;
var Mix = Magix.mix;
var VframesCount = 0;
var FirstVframesLoaded = 0;
var LastPercent = 0;
var FirstReady = 0;
var Vframes = {};
var Loc = {};

/**
 * VOM对象
 * @name VOM
 * @namespace
 */
var VOM = Magix.mix({
    /**
     * @lends VOM
     */
    /**
     * 获取所有的vframe对象
     * @return {Object}
     */
    all: function() {
        return Vframes;
    },
    /**
     * 注册vframe对象
     * @param {Vframe} vf Vframe对象
     */
    add: function(vf) {
        if (!Has(Vframes, vf.id)) {
            VframesCount++;
            Vframes[vf.id] = vf;
            VOM.fire('add', {
                vframe: vf
            });
        }
        vf.owner = VOM;
    },
    /**
     * 根据vframe的id获取vframe对象
     * @param {String} id vframe的id
     * @return {Vframe} vframe对象
     */
    get: function(id) {
        return Vframes[id];
    },
    /**
     * 删除已注册的vframe对象
     * @param {String} id vframe对象的id
     */
    remove: function(id, cc) {
        var vf = Vframes[id];
        if (vf) {
            VframesCount--;
            if (cc) FirstVframesLoaded--;
            delete Vframes[id];
            VOM.fire('remove', {
                vframe: vf
            });
        }
    },
    /**
     * 通知其中的一个vframe创建完成
     * @private
     */
    vfCreated: function() {
        if (!FirstReady) {
            FirstVframesLoaded++;
            var np = FirstVframesLoaded / VframesCount;
            if (LastPercent < np) {
                VOM.fire('progress', {
                    percent: LastPercent = np
                }, FirstReady = (np == 1));
            }
        }
    },
    /**
     * 获取根vframe对象
     */
    root: function() {
        return Vframe.root(VOM, Loc);
    },
    /**
     * 向vframe通知地址栏发生变化
     * @param {Object} e 事件对象
     * @param {Object} e.location window.location.href解析出来的对象
     * @param {Object} e.changed 包含有哪些变化的对象
     * @private
     */
    locChged: function(e) {
        var loc = e.loc;
        var hack;
        if (loc) {
            hack = 1;
        } else {
            loc = e.location;
        }
        Mix(Loc, loc);
        if (!hack) {
            var vf = VOM.root();
            var chged = e.changed;
            if (chged.isView()) {
                vf.mountView(loc.view);
            } else {
                vf.locChged(loc, chged);
            }
        }
    }
    /**
     * view加载完成进度
     * @name VOM.progress
     * @event
     * @param {Object} e
     * @param {Object} e.precent 百分比
     */
    /**
     * 注册vframe对象时触发
     * @name VOM.add
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     */
    /**
     * 删除vframe对象时触发
     * @name VOM.remove
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     */
}, Event);
    return VOM;
},{
    requires:["magix/vframe","magix/magix","magix/event"]
});
/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.0
 **/
KISSY.add("mxext/mmanager", function(S, Magix, Event) {
    /*
        #begin example-1#
        KISSY.add('testMM',function(S,MM,Model){
            var TestMM=MM.create(Model);
            TestMM.registerModels([{
                name:'Test1',
                url:'/api/test1.json'
            },{
                name:'Test2',
                url:'/api/test2.json',
                urlParams:{
                    type:'2'
                }
            }]);
            return TestMM;
        },{
            requires:["mxext/mmanager","mxext/model"]
        });

        KISSY.use('testMM',function(S,TM){
            TM.fetchAll([{
                name:'Test1'
            },{
                name:'Test2'
            }],function(m1,m2,err){

            });
        });
        #end#
     */
    var Has = Magix.has;
var SafeExec = Magix.safeExec;
var Mix = Magix.mix;
/**
 * Model管理对象，可方便的对Model进行缓存和更新
 * @name MManager
 * @class
 * @namespace
 * @param {Model} modelClass Model类
 */
var MManager = function(modelClass) {
    var me = this;
    me.$mClass = modelClass;
    me.$mCache = Magix.cache();
    me.$mCacheKeys = {};
    me.$mMetas = {};
};

var Slice = [].slice;
var WhiteList = {
    urlParams: 1,
    postParams: 1,
    cacheKey: 1,
    cacheTime: 1,
    before: 1,
    after: 1
};

var WrapDone = function(fn, model, idx) {
    return function() {
        return fn.apply(model, [model, idx].concat(Slice.call(arguments)));
    }
};
var UsedModel = function(m, f) {
    if (f) {
        for (var i = m.length - 1; i > -1; i--) {
            UsedModel(m[i]);
        }
    } else {
        var mm = m.$mm;
        if (!m.fromCache && mm.used > 0) {
            m.fromCache = true;
        }
        mm.used++;
    }
};
Mix(MManager, {
    /**
     * @lends MManager
     */
    /**
     * 创建Model类管理对象
     * @param {Model} modelClass Model类
     */
    create: function(modelClass) {
        var me = this;
        if (!modelClass) {
            throw Error('MManager.create:modelClass ungiven');
        }
        return new MManager(modelClass);
    }
});
var FetchFlags = {
    ALL: 1,
    ONE: 2,
    ORDER: 4
};
var Now = Date.now || function() {
        return +new Date()
    };
/**
 * model请求类
 * @name MRequest
 * @class
 * @namespace
 * @param {MManager} host
 */
var MRequest = function(host) {
    this.$host = host;
    this.$doTask = false;
    this.$reqModels = {};
};

var BEFORE = '_before';
var AFTER = '_after';

Mix(MRequest.prototype, {
    /**
     * @lends MRequest#
     */
    /**
     * 发送models请求，该用缓存的用缓存，该发起请求的请求
     * @private
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2},params:[]}
     * @param {Function} done   完成时的回调
     * @param {Integer} flag   获取哪种类型的models
     * @param {Boolean} save 是否是保存的动作
     * @return {MRequest}
     */
    send: function(models, done, flag, save) {
        var me = this;
        if (me.$doTask) {
            me.next(function(request) {
                request.send(models, done, flag, save);
            });
            return me;
        }
        me.$doTask = true;

        var host = me.$host;
        var modelsCache = host.$mCache;
        var modelsCacheKeys = host.$mCacheKeys;
        var reqModels = me.$reqModels;

        if (!Magix.isArray(models)) {
            models = [models];
        }
        var total = models.length;
        var current = 0;
        var errorMsg;
        var hasError;

        var doneArr = new Array(total);
        var doneArgs = [];
        var errorArgs = {};
        var orderlyArr = [];

        var doneIsArray = Magix.isArray(done);
        if (doneIsArray) {
            doneArgs = new Array(done.length);
        }
        var doneFn = function(model, idx, data, err) {
            if (me.$destroy) return; //销毁，啥也不做
            current++;
            delete reqModels[model.id];
            var mm = model.$mm;
            var cacheKey = mm.cacheKey;
            doneArr[idx] = model;
            if (err) {
                hasError = true;
                errorMsg = err;
                errorArgs[idx] = data;
            } else {
                if (!cacheKey || (cacheKey && !modelsCache.has(cacheKey))) {
                    if (cacheKey) {
                        modelsCache.set(cacheKey, model);
                    }
                    mm.doneAt = Now();
                    var after = mm.after;
                    var meta = mm.meta;

                    if (after) { //有after
                        SafeExec(after, [model, meta]);
                    }
                    host.fireAfter(meta.name, [model]);
                }
            }

            if (flag == FetchFlags.ONE) { //如果是其中一个成功，则每次成功回调一次
                var m = doneIsArray ? done[idx] : done;
                if (m) {
                    UsedModel(model);
                    doneArgs[idx] = SafeExec(m, [model, hasError ? {
                        msg: errorMsg
                    } : null, hasError ? errorArgs : null], me);
                }
            } else if (flag == FetchFlags.ORDER) {
                //var m=doneIsArray?done[idx]:done;
                orderlyArr[idx] = {
                    m: model,
                    e: hasError,
                    s: errorMsg
                };
                //
                for (var i = orderlyArr.i || 0, t, d; t = orderlyArr[i]; i++) {
                    d = doneIsArray ? done[i] : done;
                    UsedModel(t.m);
                    doneArgs[i] = SafeExec(d, [t.m, t.e ? {
                        msg: t.s
                    } : null, orderlyArr.e ? errorArgs : null, doneArgs], me);
                    if (t.e) {
                        errorArgs[i] = t.s;
                        orderlyArr.e = 1;
                    }
                }
                orderlyArr.i = i;
            }


            if (current >= total) {
                errorArgs.msg = errorMsg;
                var last = hasError ? errorArgs : null;
                if (flag == FetchFlags.ALL) {
                    UsedModel(doneArr, 1);
                    doneArr.push(last);
                    doneArgs[0] = SafeExec(done, doneArr, me);
                    doneArgs[1] = last;
                } else {
                    doneArgs.push(last);
                }
                me.$ntId = setTimeout(function() { //前面的任务可能从缓存中来，执行很快
                    me.doNext(doneArgs);
                }, 30);
            }

            if (cacheKey && Has(modelsCacheKeys, cacheKey)) {
                var fns = modelsCacheKeys[cacheKey].q;
                delete modelsCacheKeys[cacheKey];
                SafeExec(fns, [data, err], model);
            }

        };
        //

        for (var i = 0, model; i < models.length; i++) {
            model = models[i];
            if (model) {
                var modelEntity, modelInfo;
                var modelInfo = host.getModel(model, save);
                var cacheKey = modelInfo.cacheKey;
                modelEntity = modelInfo.entity;
                var wrapDoneFn = WrapDone(doneFn, modelEntity, i);

                if (cacheKey && Has(modelsCacheKeys, cacheKey)) {
                    modelsCacheKeys[cacheKey].q.push(wrapDoneFn);
                } else {
                    if (modelInfo.needUpdate) {
                        reqModels[modelEntity.id] = modelEntity;
                        if (cacheKey) {
                            modelsCacheKeys[cacheKey] = {
                                q: [],
                                e: modelEntity
                            };
                        }
                        modelEntity.request(wrapDoneFn);
                    } else {
                        wrapDoneFn();
                    }
                }
            } else {
                throw Error('miss attrs:' + models);
            }
        }
        return me;
    },
    /**
     * 获取models，所有请求完成回调done
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     * @example
            
        KISSY.add('testMM',function(S,MM,Model){
            var TestMM=MM.create(Model);
            TestMM.registerModels([{
                name:'Test1',
                url:'/api/test1.json'
            },{
                name:'Test2',
                url:'/api/test2.json',
                urlParams:{
                    type:'2'
                }
            }]);
            return TestMM;
        },{
            requires:["mxext/mmanager","mxext/model"]
        });

        KISSY.use('testMM',function(S,TM){
            TM.fetchAll([{
                name:'Test1'
            },{
                name:'Test2'
            }],function(m1,m2,err){

            });
        });
        
     */
    fetchAll: function(models, done) {
        return this.send(models, done, FetchFlags.ALL);
    },
    /**
     * 保存models，所有请求完成回调done
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveAll: function(models, done) {
        return this.send(models, done, FetchFlags.ALL, 1);
    },
    /**
     * 获取models，按顺序执行回调done
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    fetchOrder: function(models, done) {
        var cbs = Slice.call(arguments, 1);
        return this.send(models, cbs.length > 1 ? cbs : done, FetchFlags.ORDER);
    },
    /**
     * 保存models，按顺序执行回调done
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveOrder: function(models, done) {
        var cbs = Slice.call(arguments, 1);
        return this.send(models, cbs.length > 1 ? cbs : done, FetchFlags.ORDER, 1);
    },
    /**
     * 保存models，其中任意一个成功均立即回调，回调会被调用多次
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    saveOne: function(models, callback) {
        var cbs = Slice.call(arguments, 1);
        return this.send(models, cbs.length > 1 ? cbs : callback, FetchFlags.ONE, 1);
    },
    /**
     * 获取models，其中任意一个成功均立即回调，回调会被调用多次
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    fetchOne: function(models, callback) {
        var cbs = Slice.call(arguments, 1);
        return this.send(models, cbs.length > 1 ? cbs : callback, FetchFlags.ONE);
    },
    /**
     * 中止所有model的请求
     * 注意：调用该方法后会中止请求，并回调error方法
     */
    abort: function() {
        var me = this;
        clearTimeout(me.$ntId);
        var host = me.$host;
        var reqModels = me.$reqModels;
        var modelsCacheKeys = host.$mCacheKeys;

        if (reqModels) {
            for (var p in reqModels) {
                var m = reqModels[p];
                var cacheKey = m.$mm.cacheKey;
                if (cacheKey && Has(modelsCacheKeys, cacheKey)) {
                    var fns = modelsCacheKeys[cacheKey].q;
                    delete modelsCacheKeys[cacheKey];
                    if (!me.$destroy) {
                        SafeExec(fns, [null, 'aborted'], m);
                    }
                }
                m.abort();
            }
        }
        me.$reqModels = {};
        me.$queue = [];
        me.$doTask = false;
    },
    /**
     * 前一个fetchX或saveX任务做完后的下一个任务
     * @param  {Function} fn 回调
     * @return {MRequest}
     */
    next: function(fn) {
        var me = this;
        if (!me.$queue) me.$queue = [];
        me.$queue.push(fn);
        if (!me.$doTask) {
            var args = me.$latest || [];
            me.doNext.apply(me, [me].concat(args));
        }
        return me;
    },
    /**
     * 做下一个任务
     * @private
     */
    doNext: function(preArgs) {
        var me = this;
        me.$doTask = false;
        var queue = me.$queue;
        if (queue) {
            var one = queue.shift();
            if (one) {
                SafeExec(one, [me].concat(preArgs), me);
            }
        }
        me.$latest = preArgs;
    },
    /**
     * 销毁当前请求，与abort的区别是：abort后还可以继续发起新请求，而destroy后则不可以，而且不再回调相应的error方法
     */
    destroy: function() {
        var me = this;
        me.$destroy = true;
        me.abort();
    }
});

Mix(MManager.prototype, {
    /**
     * @lends MManager#
     */
    /**
     * 注册APP中用到的model
     * @param {Object|Array} models 模块描述信息
     * @param {String} models.name app中model的唯一标识
     * @param {Object} models.options 传递的参数信息，如{uri:'test',isJSONP:true,updateIdent:true}
     * @param {Object} models.urlParams 发起请求时，默认的get参数对象
     * @param {Object} models.postParams 发起请求时，默认的post参数对象
     * @param {String} models.cacheKey 指定model缓存的key，当指定后，该model会进行缓存，下次不再发起请求
     * @param {Integer} models.cacheTime 缓存过期时间，以毫秒为单位，当过期后，再次使用该model时会发起新的请求(前提是该model指定cacheKey被缓存后cacheTime才有效)
     * @param {Function} models.before model在发起请求前的回调
     * @param {Function} models.after model在请求结束，并且成功后的回调
     */
    registerModels: function(models) {
        /*
                name:'',
                options:{
                    uri:'',
                    jsonp:'true'
                },
                urlParams:'',
                postParams:'',
                cacheTime:20000,//缓存多久
                before:function(m){

                },
                after:function(m){

                }
             */
        var me = this;
        var metas = me.$mMetas;

        if (!Magix.isArray(models)) {
            models = [models];
        }
        for (var i = 0, model, name; i < models.length; i++) {
            model = models[i];
            name = model.name;
            if (model && !name) {
                throw Error('miss name attribute');
            } else if (metas[name]) { //兼容线上，存在同名时，不要抛错
                console.warn('already exist:' + name);
            }
            metas[name] = model;
        }
    },
    /**
     * 注册方法，前面是参数，后面2个是成功和失败的回调
     * @param {Object} methods 方法对象
     */
    registerMethods: function(methods) {
        var me = this;
        Mix(me, methods);
    },
    /**
     * 调用当前Manager注册的多个方法
     * @param {Array} args 要调用的方法列表，形如：[{name:'x',params:['o']},{name:'y',params:['z']}]
     * @param {Function} done 成功时的回调，传入参数跟args数组中对应的成功方法的值
     * @param {Function} error 失败回调，参数同上
     * @return {Object} 返回一个带abort方法的对象，用于取消这些方法的调用
     * @example
     * var MM=MManager.create(Model);
     * MM.registerMethods({
     *     methodA:function(args,done,error){
     *
     *     },
     *     methodB:function(args,done,error){
     *
     *     }
     * });
     *
     * //...
     * //使用时：
     *
     * MM.callMethods([
     *     {name:'methodA',params:['a']},
     *     {name:'methodB',params:['b']}
     * ],function(f1Result,f2Result){
     *
     * },function(msg){
     *     alert(msg)
     * })
     */
    /*callMethods:function(args,done,error){
            var me=this,
                doneArgs=[],
                errorMsg='',
                total=args.length,
                exec= 0,
                aborted,
                doneCheck=function(args,idx,isFail){
                    if(aborted)return;
                    exec++;
                    if(isFail){
                        errorMsg=args;
                    }else{
                         doneArgs[idx]=args;
                    }
                    if(total<=exec){
                        if(!errorMsg){
                            if(S.isFunction(done)){
                                done.apply(done,doneArgs);
                            }
                        }else{
                            if(S.isFunction(error)){
                                error(errorMsg);
                            }
                        }
                    }
                },
                check=function(idx,isSucc){
                    return function(args){
                        doneCheck(args,idx,!isSucc);
                    };
                };
            for(var i=0,one;i<args.length;i++){
                one=args[i];
                var fn;
                if(S.isFunction(one.name)){
                    fn=one.name;
                }else{
                    fn=me[one.name];
                }
                if(fn){
                    if(!one.params)one.params=[];
                    if(!S.isArray(one.params))one.params=[one.params];

                    one.params.push(check(i,true),check(i));
                    fn.apply(me,one.params);
                }else{
                    doneCheck('unfound:'+one.name,i,true);
                }
            }
            return {
                abort:function(){
                    aborted=true;
                }
            }
        },*/
    /**
     * 创建model对象
     * @param {Object} modelAttrs           model描述信息对象
     * @return {Object}
     */
    createModel: function(modelAttrs) {
        var me = this;
        var meta = me.getModelMeta(modelAttrs);

        var entity = new me.$mClass();
        entity.set(meta, WhiteList);
        entity.$mm = {
            used: 0
        };
        var before = modelAttrs.before || meta.before;

        me.fireBefore(meta.name, [entity]);

        if (Magix.isFunction(before)) {
            SafeExec(before, [entity, meta, modelAttrs]);
        }

        var after = modelAttrs.after || meta.after;

        entity.$mm.after = after;

        var cacheKey = modelAttrs.cacheKey || meta.cacheKey;

        if (Magix.isFunction(cacheKey)) {
            cacheKey = SafeExec(cacheKey, [meta, modelAttrs]);
        }

        entity.$mm.cacheKey = cacheKey;
        entity.$mm.meta = meta;
        entity.set(modelAttrs, WhiteList);
        //默认设置的
        entity.setUrlParams(meta.urlParams);
        entity.setPostParams(meta.postParams);

        //临时传递的
        entity.setUrlParams(modelAttrs.urlParams);
        entity.setPostParams(modelAttrs.postParams);

        return entity;
    },
    /**
     * 获取model注册时的元信息
     * @param  {String|Object} modelAttrs 名称
     * @return {Object}
     * @throws {Error} If unfound:name
     */
    getModelMeta: function(modelAttrs) {
        var me = this;
        var metas = me.$mMetas;
        var name;
        if (Magix.isString(modelAttrs)) {
            name = modelAttrs;
        } else {
            name = modelAttrs.name;
        }
        var meta = metas[name];
        if (!meta) {
            throw Error('Not found:' + modelAttrs.name);
        }
        return meta;
    },
    /**
     * 获取model对象，优先从缓存中获取
     * @param {Object} modelAttrs           model描述信息对象
     * @param {Boolean} createNew 是否是创建新的Model对象，如果否，则尝试从缓存中获取
     * @return {Object}
     */
    getModel: function(modelAttrs, createNew) {
        var me = this;
        var entity;
        var needUpdate;
        if (!createNew) {
            entity = me.getCachedModel(modelAttrs);
        }

        if (!entity) {
            needUpdate = true;
            entity = me.createModel(modelAttrs);
        }
        return {
            entity: entity,
            cacheKey: entity.$mm.cacheKey,
            needUpdate: needUpdate
        }
    },
    /**
     * 保存models，所有请求完成回调done
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveAll: function(models, done) {
        return new MRequest(this).saveAll(models, done);
    },
    /**
     * 获取models，所有请求完成回调done
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    fetchAll: function(models, done) {
        return new MRequest(this).fetchAll(models, done);
    },
    /**
     * 保存models，按顺序回回调done
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveOrder: function(models, done) {
        var mr = new MRequest(this);
        return mr.saveOrder.apply(mr, arguments);
    },
    /**
     * 获取models，按顺序回回调done
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    fetchOrder: function(models, done) {
        var mr = new MRequest(this);
        return mr.fetchOrder.apply(mr, arguments);
    },
    /**
     * 保存models，其中任意一个成功均立即回调，回调会被调用多次
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    saveOne: function(models, callback) {
        var mr = new MRequest(this);
        return mr.saveOne.apply(mr, arguments);
    },
    /**
     * 获取models，其中任意一个成功均立即回调，回调会被调用多次
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    fetchOne: function(models, callback) {
        var mr = new MRequest(this);
        return mr.fetchOne.apply(mr, arguments);
    },
    /**
     * 根据key清除缓存的models
     * @param  {String} key 字符串
     */
    clearCacheByKey: function(key) {
        var me = this;
        var modelsCache = me.$mCache;
        modelsCache.del(key);
    },
    /**
     * 根据name清除缓存的models
     * @param  {String} name 字符串
     */
    clearCacheByName: function(name) {
        var me = this;
        var modelsCache = me.$mCache;
        var test;
        var list = modelsCache.c;
        for (var i = 0; i < list.length; i++) {
            var one = list[i];
            var m = one.v;
            var mm = m && m.$mm;
            if (mm) {
                var tName = mm.meta.name;
                if (tName == name) {
                    modelsCache.del(mm.cacheKey);
                }
            }
        }
    },
    /**
     * 获取model的url
     * @param  {String|Object} name model元信息名称
     * @return {String}
     */
    getModelUrl: function(name) {
        var me = this;
        var meta = me.getModelMeta(name);
        if (meta.url) {
            return meta.url;
        } else {
            return me.$mClass.prototype.url(meta.uri);
        }
    },
    /**
     * 监听某个model的before
     * @param  {String}   name     注册时元信息中的名称
     * @param  {Function} callback 回调
     */
    listenBefore: function(name, callback) {
        Event.on.call(this, name + BEFORE, callback);
    },
    /**
     * 监听某个model的after
     * @param  {String}   name     注册时元信息中的名称
     * @param  {Function} callback 回调
     */
    listenAfter: function(name, callback) {
        Event.on.call(this, name + AFTER, callback);
    },
    /**
     * 取消before监听
     * @param  {String}   name     注册时元信息的名称
     * @param  {Function} [callback] 回调
     */
    unlistenBefore: function(name, callback) {
        Event.un.call(this, name + BEFORE, callback);
    },
    /**
     * 取消after监听
     * @param  {String}   name     注册时元信息的名称
     * @param  {Function} [callback] 回调
     */
    unlistenAfter: function(name, callback) {
        Event.un.call(this, name + AFTER, callback);
    },
    /**
     * 触发某个model的before监听
     * @param  {String} name 注册时元信息中的名称
     * @param  {Object} [args] 数据
     */
    fireBefore: function(name, args) {
        Event.fire.call(this, name + BEFORE, args);
    },
    /**
     * 触发某个model的after监听
     * @param  {String} name 注册时元信息中的名称
     * @param  {Object} [args] 数据
     */
    fireAfter: function(name, args) {
        Event.fire.call(this, name + AFTER, args);
    },
    /**
     * 从缓存中获取model对象
     * @param  {String|Object} modelAttrs
     * @return {Model}
     */
    getCachedModel: function(modelAttrs) {
        var me = this;
        var modelsCache = me.$mCache;
        var entity = null;
        var cacheKey;
        var meta;
        if (Magix.isString(modelAttrs)) {
            cacheKey = modelAttrs;
        } else {
            meta = me.getModelMeta(modelAttrs);
            cacheKey = modelAttrs.cacheKey || meta.cacheKey;
            if (Magix.isFunction(cacheKey)) {
                cacheKey = SafeExec(cacheKey, [meta, modelAttrs]);
            }
        }

        if (cacheKey) {
            var requestCacheKeys = me.$mCacheKeys;
            var info = requestCacheKeys[cacheKey];
            if (info) {
                entity = info.e;
            } else if (entity = modelsCache.get(cacheKey)) { //缓存
                if (!meta) meta = entity.$mm.meta;
                var cacheTime = modelAttrs.cacheTime || meta.cacheTime || 0;

                if (Magix.isFunction(cacheTime)) {
                    cacheTime = SafeExec(cacheTime, [meta, modelAttrs]);
                }

                if (cacheTime > 0) {
                    if (Now() - entity.$mm.doneAt > cacheTime) {
                        me.clearCacheByKey(cacheKey);
                        entity = null;
                    }
                }
            }
        }
        return entity;
    }
});
    return MManager;
}, {
    requires: ["magix/magix", "magix/event"]
});
/**
 * @fileOverview Model
 * @version 1.0
 * @author 行列
 */
KISSY.add("mxext/model", function(S, Magix) {
    var Extend = function(props, ctor) {
        var BaseModel = function() {
            BaseModel.superclass.constructor.apply(this, arguments);
            if (ctor) {
                Magix.safeExec(ctor, [], this);
            }
        }
        Magix.mix(BaseModel, this, {
            prototype: true
        });
        ProcessObject(props, this.prototype);
        return S.extend(BaseModel, this, props);
    };
    /**
 * Model类
 * @name Model
 * @namespace
 * @class
 * @constructor
 * @param {Object} ops 初始化Model时传递的其它参数对象
 * @property {String} id model唯一标识
 * @property {Boolean} fromCache 在与ModelManager配合使用时，标识当前model对象是不是从缓存中来
 */
var ProcessObject = function(props, proto, enterObject) {
    for (var p in proto) {
        if (Magix.isObject(proto[p])) {
            if (!Magix.has(props, p)) props[p] = {};
            ProcessObject(props[p], proto[p], true);
        } else if (enterObject) {
            props[p] = proto[p];
        }
    }
};
var GUID = +new Date();
var Model = function(ops) {
    if (ops) {
        this.set(ops);
    }
    this.id = 'm' + GUID--;
};

var Encode = encodeURIComponent;

Magix.mix(Model, {
    /**
     * @lends Model
     */
    /**
     * GET枚举
     * @type {String}
     */
    GET: 'GET',
    /**
     * POST枚举
     * @type {String}
     */
    POST: 'POST',
    /**
     * 继承
     * @function
     * @param {Object} props 方法对象
     * @param {Function} ctor 继承类的构造方法
     */
    extend: Extend
});


Magix.mix(Model.prototype, {
    /**
     * @lends Model#
     */
    /**
     * url映射对象
     * @type {Object}
     */
    urlMap: {

    },
    /**
     * Model调用request方法后，与服务器同步的方法，供应用开发人员覆盖
     * @function
     * @param {Function} callback 请求完成后的回调，回调时第1个参数是数据，第2个是错误对象
     * @return {XHR} 最好返回异步请求的对象
     */
    sync: Magix.noop,
    /**
     * 处理Model.sync成功后返回的数据
     * @function
     * @param {Object|String} resp 返回的数据
     * @return {Object}
     */
    parse: function(r) {
        return r;
    },
    /**
     * 获取参数对象
     * @param  {String} [type] 参数分组的key[Model.GET,Model.POST]，默认为Model.GET
     * @return {Object}
     */
    /*getParamsObject:function(type){
            if(!type)type=Model.GET;
            return this['$'+type]||null;
        },*/
    /**
     * 获取参数对象
     * @return {Object}
     */
    /* getUrlParamsObject:function(){
            return this.getParamsObject(Model.GET);
        },*/
    /**
     * 获取Post参数对象
     * @return {Object}
     */
    /*getPostParamsObject:function(){
            return this.getParamsObject(Model.POST);
        },*/
    /**
     * 获取通过setPostParams放入的参数
     * @return {String}
     */
    getPostParams: function() {
        return this.getParams(Model.POST);
    },
    /**
     * 获取通过setUrlParams放入的参数
     * @return {String}
     */
    getUrlParams: function() {
        return this.getParams(Model.GET);
    },
    /**
     * 获取参数
     * @param {String} [type] 参数分组的key[Model.GET,Model.POST]，默认为Model.GET
     * @return {String}
     */
    getParams: function(type) {
        var me = this;
        if (!type) {
            type = Model.GET;
        } else {
            type = type.toUpperCase();
        }
        var k = '$' + type;
        var params = me[k];
        var arr = [];
        var v;
        if (params) {
            for (var p in params) {
                v = params[p];
                if (Magix.isArray(v)) {
                    for (var i = 0; i < v.length; i++) {
                        arr.push(p + '=' + Encode(v[i]));
                    }
                } else {
                    arr.push(p + '=' + Encode(v));
                }
            }
        }
        return arr.join('&');
    },
    /**
     * 设置url参数，只有未设置过的参数才进行设置
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     */
    setUrlParamsIf: function(obj1, obj2) {
        this.setParams(obj1, obj2, Model.GET, true);
    },
    /**
     * 设置post参数，只有未设置过的参数才进行设置
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     */
    setPostParamsIf: function(obj1, obj2) {
        var me = this;
        me.setParams(obj1, obj2, Model.POST, true);
    },
    /**
     * 设置参数
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     * @param {String}   type      参数分组的key
     * @param {Boolean}   ignoreIfExist   如果存在同名的参数则不覆盖，忽略掉这次传递的参数
     * @param {Function} callback 对每一项参数设置时的回调
     */
    setParams: function(obj1, obj2, type, ignoreIfExist) {
        if (!type) {
            type = Model.GET;
        } else {
            type = type.toUpperCase();
        }
        var me = this;
        if (!me.$types) me.$types = {};
        me.$types[type] = true;

        var k = '$' + type;
        if (!me[k]) me[k] = {};
        if (Magix.isObject(obj1)) {
            for (var p in obj1) {
                if (!ignoreIfExist || !me[k][p]) {
                    me[k][p] = obj1[p];
                }
            }
        } else if (obj1) {
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
    setPostParams: function(obj1, obj2) {
        var me = this;
        me.setParams(obj1, obj2, Model.POST);
    },
    /**
     * 设置url参数
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     */
    setUrlParams: function(obj1, obj2) {
        this.setParams(obj1, obj2, Model.GET);
    },
    /**
     * @private
     */
    /*removeParamsObject:function(type){
            if(!type)type=Model.GET;
            delete this['$'+type];
        },*/
    /**
     * @private
     */
    /*removePostParamsObject:function(){
            this.removeParamsObject(Model.POST);
        },*/
    /**
     * @private
     */
    /*removeUrlParamsObject:function(){
            this.removeParamsObject(Model.GET);
        },*/
    /**
     * 重置缓存的参数对象，对于同一个model反复使用前，最好能reset一下，防止把上次请求的参数也带上
     */
    reset: function() {
        var me = this;
        var keysCache = me.$types;
        if (keysCache) {
            for (var p in keysCache) {
                if (Magix.has(keysCache, p)) {
                    delete me['$' + p];
                }
            }
            delete me.$types;
        }
        var keys = me.$keys;
        var attrs = me.$attrs;
        if (keys) {
            for (var i = 0; i < keys.length; i++) {
                delete attrs[keys[i]];
            }
            delete me.$keys;
        }
    },
    /**
     * 获取model对象请求时的后台地址
     * @return {String}
     */
    url: function(uri) {
        var self = this,
            url = self.get('url'),
            uris;
        uri = uri || self.get('uri');
        if (uri) {
            uris = uri.split(':');
            var maps = self.urlMap;
            if (maps) {
                for (var i = 0, parent = maps, j = uris.length; i < j; i++) {
                    parent = parent[uris[i]];
                    if (!parent) {
                        break;
                    }
                }
                uri = parent || uri;
            }
            url = uri;
        } else if (!url) {
            throw new Error('model not set uri and url');
        }
        return url;
    },
    /**
     * 获取属性
     * @param {String} type type
     * @return {Object}
     */
    get: function(type) {
        var me = this;
        var getAll = !arguments.length;
        var attrs = me.$attrs;
        if (attrs) {
            return getAll ? attrs : attrs[type];
        }
        return null;
    },
    /**
     * 设置属性
     * @param {String|Object} key 属性对象或属性key
     * @param {Object} [val] 属性值
     */
    set: function(key, val, saveKeyList) {
        var me = this;
        if (!me.$attrs) me.$attrs = {};
        if (saveKeyList && !me.$keys) {
            me.$keys = [];
        }
        if (Magix.isObject(key)) {
            if (!Magix.isObject(val)) {
                val = {}
            }
            for (var p in key) {
                if (saveKeyList) {
                    me.$keys.push(p);
                }
                if (!Magix.has(val, p)) {
                    me.$attrs[p] = key[p];
                }
            }
        } else if (key) {
            if (saveKeyList) {
                me.$keys.push(key);
            }
            me.$attrs[key] = val;
        }
    },
    /**
     * 向服务器请求，加载或保存数据
     * @param {Function} callback 请求成功或失败的回调
     */
    request: function(callback, options) {
        if (!callback) callback = function() {};
        var callbackIsFn = Magix.isFunction(callback);

        var success = callback.success;
        var error = callback.error;

        var me = this;
        me.$abort = false;
        var temp = function(data, err) {
            if (!me.$abort) {
                if (err) {
                    callbackIsFn && callback(data, err, options);
                    if (error) {
                        error.call(me, err);
                    }
                } else {
                    if (data) {
                        var val = me.parse(data);
                        if (!Magix.isObject(val)) {
                            val = {
                                data: val
                            };
                        }
                        me.set(val, null, true);
                    }
                    callbackIsFn && callback(data, err, options);
                    if (success) {
                        success.call(me, data);
                    }
                }
            }
        };
        temp.success = function(data) {
            temp(data);
        };
        temp.error = function(msg) {
            temp(null, msg || 'request error');
        };
        me.$trans = me.sync(temp, options);
    },
    /**
     * 中止请求
     */
    abort: function() {
        var me = this;
        if (me.$trans && me.$trans.abort) {
            me.$trans.abort();
        }
        delete me.$trans;
        me.$abort = true;
    },
    /**
     * 获取当前model是否已经取消了请求
     * @return {Boolean}
     */
    isAborted: function() {
        return this.$abort;
    },
    /**
     * 开始事务
     * @example
     * //...
     * var userList=m.get('userList');//从model中取出userList数据
     * m.beginTransaction();//开始更改的事务
     * userList.push({userId:'58782',userName:'xinglie.lkf'});//添加一个新用户
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
    
    /**
     * 回滚对model数据做的更改
     */
    rollbackTransaction: function() {
        var me = this;
        var bakAttrs = me.$bakAttrs;
        if (bakAttrs) {
            me.$attrs = bakAttrs;
            delete me.$bakAttrs;
        }
    },
    /**
     * 结束事务
     */
    endTransaction: function() {
        delete this.$bakAttrs;
    }
});
    Model.prototype.beginTransaction = function() {
        var me = this;
        me.$bakAttrs = S.clone(me.$attrs);
    };
    return Model;
}, {
    requires: ["magix/magix"]
});
/**
 * @fileOverview 对magix/view的扩展
 * @version 1.0
 * @author 行列
 */
KISSY.add('mxext/view', function(S, Magix, View, Router) {
    var WIN = window;

var DestroyTimer = function(id) {
    WIN.clearTimeout(id);
    WIN.clearInterval(id);
};

var Destroy = function(res) {
    SafeExec(res.destroy, [], res);
};

var ResCounter = 0;
var SafeExec = Magix.safeExec;
var Has = Magix.has;
var VOMEventsObject = {};
var PrepareVOMMessage = function(vom) {
    if (!PrepareVOMMessage.d) {
        PrepareVOMMessage.d = 1;
        vom.on('add', function(e) {
            var vf = e.vframe;
            var list = VOMEventsObject[vf.id];
            if (list) {
                for (var i = 0; i < list.length; i++) {
                    PostMessage(vf, list[i]);
                }
                delete VOMEventsObject[vf.id];
            }
        });
        vom.on('remove', function(e) {
            delete VOMEventsObject[e.vframe.id];
        });
        var vf = vom.root();
        vf.on('created', function() {
            VOMEventsObject = {};
        });
    }
};
var PostMessage = function(vframe, args) {
    var view = vframe.view;
    if (view && vframe.viewInited) {
        SafeExec(view.receiveMessage, args, view);
    } else {
        var interact = function(e) {
            vframe.un('viewInited', interact);
            SafeExec(e.view.receiveMessage, args, e.view);
        };
        vframe.on('viewInited', interact);
    }
};
/**
 * @name MxView
 * @namespace
 * @requires View
 * @augments View
 */
var MxView = View.extend({
    /**
     * @lends MxView#
     */
    /**
     * 当前view实例化后调用，供子类重写
     * @function
     */
    mxViewCtor: Magix.noop, //供扩展用
    /**
     * 调用magix/router的navigate方法
     */
    navigate: function() {
        Router.navigate.apply(Router, arguments);
    },
    /**
     * 让view帮你管理资源，<b>强烈建议对组件等进行托管</b>
     * @param {String|Object} key 托管的资源或要共享的资源标识key
     * @param {Object} res 要托管的资源
     * @return {Object} 返回传入的资源，对于函数会自动进行一次包装
     * @example
     * init:function(){
     *      this.manage('user_list',[//管理对象资源
     *          {id:1,name:'a'},
     *          {id:2,name:'b'}
     *      ]);
     * },
     * render:function(){
     *      var _self=this;
     *      var m=new Model();
     *      m.load({
     *          success:function(resp){
     *              //TODO
     *              var brix=new BrixDropdownList();
     *
     *              _self.manage(brix);//管理组件
     *
     *              var pagination=_self.manage(new BrixPagination());//也可以这样
     *
     *              var timer=_self.manage(setTimeout(function(){
     *                  S.log('timer');
     *              },2000));//也可以管理定时器
     *
     *
     *              var userList=_self.getManaged('user_list');//通过key取托管的资源
     *
     *              S.log(userList);
     *          },
     *          error:function(msg){
     *              //TODO
     *          }
     *      });
     *
     *      _self.manage(m);
     * }
     */
    manage: function(key, res) {
        var me = this;
        var args = arguments;
        var hasKey = true;
        if (args.length == 1) {
            res = key;
            key = 'res_' + (ResCounter++);
            hasKey = false;
        }
        if (!me.$res) me.$res = {};
        var destroy;
        if (Magix.isNumber(res)) {
            destroy = DestroyTimer;
        } else if (res && res.destroy) {
            destroy = Destroy;
        }
        var wrapObj = {
            hasKey: hasKey,
            res: res,
            destroy: destroy
        };
        me.$res[key] = wrapObj;
        return res;
    },
    /**
     * 获取托管的资源
     * @param {String} key 托管资源时传入的标识key
     * @return {Object}
     */
    getManaged: function(key) {
        var me = this;
        var cache = me.$res;
        var sign = me.sign;
        if (cache && Has(cache, key)) {
            var wrapObj = cache[key];
            var resource = wrapObj.res;
            return resource;
        }
        return null;
    },
    /**
     * 移除托管的资源
     * @param {String|Object} param 托管时标识key或托管的对象
     * @return {Object} 返回移除的资源
     */
    removeManaged: function(param) {
        var me = this,
            res = null;
        var cache = me.$res;
        if (cache) {
            if (Has(cache, param)) {
                res = cache[param].res;
                delete cache[param];
            } else {
                for (var p in cache) {
                    if (cache[p].res === param) {
                        res = cache[p].res;
                        delete cache[p];
                        break;
                    }
                }
            }
        }
        return res;
    },
    /**
     * 销毁托管的资源
     * @private
     */
    destroyManaged: function(e) {
        var me = this;
        var cache = me.$res;
        //
        if (cache) {
            for (var p in cache) {
                var o = cache[p];
                //var processed=false;
                var res = o.res;
                var destroy = o.destroy;
                var processed = false;
                if (destroy) {
                    destroy(res);
                    processed = true;
                }
                if (!o.hasKey) { //如果托管时没有给key值，则表示这是一个不会在其它方法内共享托管的资源，view刷新时可以删除掉
                    delete cache[p];
                }
                me.fire('destroyManaged', {
                    resource: res,
                    processed: processed
                });
            }
            if (e.type == 'destroy') { //如果不是刷新，则是view的销毁
                //me.un('destroyResource');
                delete me.$res;
            }
        }
    },
    /**
     * 用于接受其它view通过postMessageTo方法发来的消息，供最终的view开发人员进行覆盖
     * @function
     * @param {Object} e 通过postMessageTo传递的第二个参数
     */
    receiveMessage: Magix.noop,
    /**
     * 向某个vframe发送消息
     * @param {Array|String} aims  目标vframe id数组
     * @param {Object} args 消息对象
     */
    postMessageTo: function(aims, args) {
        var vom = this.vom;
        PrepareVOMMessage(vom);

        if (!Magix.isArray(aims)) {
            aims = [aims];
        }
        if (!args) args = {};
        for (var i = 0, it; i < aims.length; i++) {
            it = aims[i];
            var vframe = vom.get(it);
            if (vframe) {
                PostMessage(vframe, args);
            } else {
                if (!VOMEventsObject[it]) {
                    VOMEventsObject[it] = [];
                }
                VOMEventsObject[it].push(args);
            }
        }
    },
    /**
     * @private
     */
    destroyMRequest: function() {
        var me = this;
        var cache = me.$res;
        if (cache) {
            for (var p in cache) {
                var o = cache[p];
                var res = o.res;
                if (res && res.fetchOne && res.fetchAll) { //销毁MRequest
                    res.destroy();
                    delete cache[p];
                }
            }
        }
    }
}, function() {
    var me = this;
    me.beginUpdateHTML = me.beginUpdate;
    me.endUpdateHTML = me.endUpdate; //兼容线上，这2行不要删除
    me.on('interact', function() {
        me.on('rendercall', me.destroyMRequest);
        me.on('prerender', me.destroyManaged);
        me.on('destroy', me.destroyManaged);
    });
    me.mxViewCtor();
});

/**
 * view销毁托管资源时发生
 * @name MxView#destroyResource
 * @event
 * @param {Object} e
 * @param {Object} e.resource 托管的资源
 * @param {Boolean} e.processed 表示view是否对这个资源做过销毁处理，目前view仅对带 abort destroy dispose方法的资源进行自动处理，其它资源需要您响应该事件自已处理
 */
    return MxView;
}, {
    requires: ["magix/magix", "magix/view", "magix/router"]
});
/**
 * @fileOverview Magix启动入口
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
(function(W) {
    document.createElement('vframe');
    var noop = function() {};
    if (!W.console) {
        W.console = {
            log: noop,
            info: noop,
            warn: noop
        }
    };
    var tempCfg, cCfg = {};
    if (!W.Magix) {
        W.Magix = {
            config: function(cfg) {
                for (var p in cfg) {
                    cCfg[p] = cfg[p];
                }
            },
            start: function(cfg) {
                tempCfg = cfg || {};
            }
        };
        KISSY.use('magix/magix', function(S, M) {
            W.Magix = M;
            M.config(cCfg);
            if (tempCfg) {
                M.start(tempCfg);
            }
        });
    }
})(this);