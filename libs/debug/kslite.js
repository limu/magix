/**
 * KISSY -- An Enjoyable UI Library : Keep It Simple & Stupid, Short & Sweet, Slim & Sexy...<br/>
 * KSLITE -- KISSY的子集,通过精简过的有限的方法,提供模块管理,OO支持等基本功能
 * @module kslite
 * @author lifesinger@gmail.com,limu@taobao.com
 */
/**
 * KSLITE -- KISSY的子集,通过精简过的有限的方法,提供模块管理,OO支持等基本功能
 * @class KSLITE
 * @type kslite
 * @static
 */
(function(win, S, undefined){
    var kslite_config = {
        "lt_pkgs": {
            "test": "../",
            "cc": "../demo/"
        },
        "lt_v": "0.3.0",
        "lt_t": "1"
    };
    kslite_config.lt_pkgs.packages = "http://a.alimama.cn/kslite/";
    var kslite_onload = win.KSLITEonLoad, kslite_pkgpaths = win.KSLITEpkgPaths;
    if (win[S] === undefined) {
        win[S] = {};
    }
    S = win[S];
    var doc = win.document;
    var toString = Object.prototype.toString;
    var mix = function(r, s, ov, wl){
        if (!s || !r) {
            return r;
        }
        if (ov === undefined) {
            ov = true;
        }
        var i, p, l;
        if (wl && (l = wl.length)) {
            for (i = 0; i < l; i++) {
                p = wl[i];
                if (p in s) {
                    if (ov || !(p in r)) {
                        r[p] = s[p];
                    }
                }
            }
        }
        else {
            for (p in s) {
                if (ov || !(p in r)) {
                    r[p] = s[p];
                }
            }
        }
        return r;
    };
    var head = doc.getElementsByTagName('head')[0] || doc.documentElement;
    var INIT = 0, LOADING = 1, LOADED = 2, ERROR = 3, ATTACHED = 4, RE_CSS = /\.css(?:\?|$)/i;
    var scriptOnload = doc.createElement('script').readyState ? function(node, callback){
        var oldCallback = node.onreadystatechange;
        node.onreadystatechange = function(){
            var rs = node.readyState;
            if (rs === 'loaded' || rs === 'complete') {
                node.onreadystatechange = null;
                if (oldCallback) {
                    oldCallback();
                }
                callback.call(this);
            }
        };
    }
 : function(node, callback){
        node.addEventListener('load', callback, false);
		node.addEventListener('error', callback, false);
    };
    function getInteractiveScript(){
        if (navigator.userAgent.indexOf("MSIE") < 0) {
            return null;
        }
        var scripts = head.getElementsByTagName('script');
        var script, i = 0, len = scripts.length;
        for (; i < len; i++) {
            script = scripts[i];
            if (script.readyState === 'interactive') {
                return script;
            }
        }
        return null;
    }
    mix(S, {
        /**
         * The version of the library.
         * @property version
         * @type {String}
         */
        version: kslite_config.lt_v,
        _init: function(){
            var x, currentScript, scripts = doc.getElementsByTagName('script');
            if (!window.KSLITEcurrentScript) {
                for (x = 0; x < scripts.length; x++) {
                    if (scripts[x].kslite) {
                        window.KSLITEcurrentScript = scripts[x];
                        break;
                    }
                }
            }
            currentScript = window.KSLITEcurrentScript || scripts[scripts.length - 1];
            window.KSLITEcurrentScript = currentScript;
            var base = (currentScript.src).split("/").slice(0, -1).join("/") + "/";
            S.Env = {
                mods: {},
                fns: {},
                _loadQueue: {},
                _relies: {//kslite add
                    rq: {},
                    sp: {}
                }
            };
            S.Config = {
                debug: false,
                base: base,
                timeout: 10,
                kslite: kslite_config
            };
            S.mix(S.Config, kslite_config);
            S.declare("kslite", [], function(require, exports){
                exports = S.mix(exports, S, true, ["path", "log", "getScript", "substitute", "clone", "mix", "multiAsync", "extend", "iA", "iF", "iPO", "iS"]);
            });
            S.provide(["kslite"], function(require){
                S.require("kslite").log("kslite inited");
            });
            //debug
            if (/demo|debug|test/.test(location.href)) {
                S.Config.debug = true;
            }
            if (S.Config.debug) {
                kslite_config.lt_t += (new Date()).getTime() + ".js";
            }
            var i;
            //pkg
            function addPath(s){
                var pp = s.split("@");
                kslite_config.lt_pkgs[pp[0]] = pp[1];
            }
            win.KSLITEpkgPaths = {
                push: function(s){
                    addPath(s);
                }
            };
            if (kslite_pkgpaths && S.iA(kslite_pkgpaths)) {
                for (i = 0; i < kslite_pkgpaths.length; i++) {
                    addPath(kslite_pkgpaths[i]);
                }
            }
            //timestamp           
            kslite_config.lt_t = win.KSLITEtimestamp || kslite_config.lt_t;
            //onload
            win.KSLITEonLoad = {
                push: function(fn){
                    if (fn && S.iF(fn)) {
                        fn(S);
                    }
                }
            };
            if (kslite_onload && S.iA(kslite_onload)) {
                for (i = 0; i < kslite_onload.length; i++) {
                    if (S.iF(kslite_onload[i])) {
                        kslite_onload[i](S);
                    }
                }
            }
        },
        /**
         * Copies all the properties of s to r.
         * @method mix
         * @param r {Object} 目标对象
         * @param s {Object} 源对象
         * @param ov {Boolean} 是否强制覆盖
         * @param wl {Array} 如果存在白名单,只覆盖白名单内的对象.
         * @return {Object} the augmented object
         */
        mix: mix,
        /**
         * Prints debug info.
         * @method log
         * @param msg {String} the message to log.
         * @param cat {String} the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param src {String} the source of the the message (opt)
         * @return {KSLITE}
         */
        log: function(msg, cat, src){
            if (S.Config.debug) {
                if (win.console !== undefined && console.log) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                }
            }
            return S;
        },
        /**
         * Clone Object
         * @method clone
         * @param o {Object} 源对象
         * @return {Object} the object cloned
         */
        clone: function(o){
            var ret = o, b, k;
            if (o && ((b = S.iA(o)) || S.iPO(o))) {
                ret = b ? [] : {};
                for (k in o) {
                    if (o.hasOwnProperty(k)) {
                        ret[k] = S.clone(o[k]);
                    }
                }
            }
            return ret;
        },
        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @method extend
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param px {Object} prototype properties to add/override
         * @param sx {Object} static properties to add/override
         * @return r {Object}
         */
        extend: function(r, s, px, sx){
            if (!s || !r) {
                return r;
            }
            var OP = Object.prototype, O = function(o){
                function F(){
                }
                F.prototype = o;
                return new F();
            }, sp = s.prototype, rp = O(sp);
            r.prototype = rp;
            rp.constructor = r;
            r.superclass = sp;
            if (s !== Object && sp.constructor === OP.constructor) {
                sp.constructor = s;
            }
            if (px) {
                mix(rp, px);
            }
            if (sx) {
                mix(r, sx);
            }
            return r;
        },
        /**
         * Substitutes keywords in a string using an object/array.
         * Removes undefined keywords and ignores escaped keywords.
         * @param str {String}模板字符串
         * @param o {String}模板数据
         * @param regexp {String}替换用正则 可以用来代替默认值
         * @param multiSubstitute {Boolean} 是否支持多次substitute 为true,str中的模板如果匹配不到将被保留而不是置空.
         */
        substitute: function(str, o, regexp, multiSubstitute){
            if (!S.iS(str) || !S.iPO(o)) {
                return str;
            }
            return str.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] !== undefined) ? o[name] : (multiSubstitute ? match : "");
            });
        },
        /**
         * Load a JavaScript file from the server using a GET HTTP request, then execute it.
         * <pre>
         *  getScript(url, success, charset);
         *  or
         *  getScript(url, {
         *      charset: string
         *      success: fn,
         *      error: fn,
         *      timeout: number
         *  });
         * </pre>
         * @param url {String} 文件地址
         * @param success {Function|Object} 回调函数
         * @param charset {String} 字符串
         */
        getScript: function(url, success, charset, expando){
            var isCSS = RE_CSS.test(url), node = doc.createElement(isCSS ? 'link' : 'script');
            var config = success, error, timeout, timer, k;
            if (S.iPO(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }
            if (isCSS) {
                node.href = url;
                node.rel = 'stylesheet';
            }
            else {
                node.src = url;
                node.async = true;
            }
            if (charset) {
                node.charset = charset;
            }
            if (expando) {
                for (k in expando) {
                    node.setAttribute(k, expando[k]);
                }
            }
            if (S.iF(success)) {
                if (isCSS) {
                    success.call(node);
                }
                else {
                    scriptOnload(node, function(){
                        if (timer) {
                            timer.cancel();
                            timer = undefined;
                        }
                        success.call(node);
                    });
                }
            }
            if (S.iF(error)) {
                timer = setTimeout(function(){
                    timer = undefined;
                    error();
                }, (timeout || S.Config.timeout) * 1000);
            }
            head.insertBefore(node, head.firstChild);
            return node;
        },
        iF: function(o){
            return toString.call(o) === '[object Function]';
        },
        iA: function(o){
            return toString.call(o) === '[object Array]';
        },
        iS: function(o){
            return toString.call(o) === '[object String]';
        },
        iPO: function(o){
            return o && toString.call(o) === '[object Object]' && !o.nodeType && !o.setInterval;
        },
        /**
         * Add a module.<br/>
         * S.add('mod-name',function(S){});
         * @param name {String} module name
         * @param fn {Function} entry point into the module that is used to bind module to KSLITE
         * @return {KSLITE}
         */
        add: function(name, fn, config){
            var mods = S.Env.mods, mod;
            if (mods[name] && mods[name].status > INIT) {
                return;
            }
            mod = {
                name: name,
                fn: fn || null,
                status: LOADED
            };
            if (S.iA(config)) {
                config = {
                    requires: config
                };
            }
            mix(mod, config);
            mods[name] = mod;
            return S;
        },
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.<br/>
         * S.use('mod-name',function(S){});
         * @param modNames {String} 不同模块间以逗号(,)分隔
         * @param callback {Function} 相关代码引入成功后的回调函数
         */
        use: function(modNames, callback){
            modNames = modNames.split(',');
            var mods = S.Env.mods;
            S._aMs(modNames, function(){
                if (callback) {
                    callback(S);
                }
            });
        },
        _aMs: function(modNames, callback){
            var i, asyncers = {};
            for (i = 0; i < modNames.length; i++) {
                asyncers[modNames[i]] = {
                    f: S._aM,
                    a: modNames[i]
                };
            }
            S.multiAsync(asyncers, callback);
        },
        _aM: function(modName, callback){//require! | noreg mod | cycling require! | name2path! | load queue!
            var mod, requires;
            var mods = S.Env.mods, rqmap = S.Env._relies.rq, spmap = S.Env._relies.sp;
            function attachMod(mod){
                if (mod.status != ATTACHED) {
                    if (mod.fn) {
                        S.log("attach " + mod.name);
                        mod.fn(S, S.require(mod.name), S._ns(mod.name));
                    }
                    else {
                        S.log("attach " + mod.name + " without expected attach fn!", "warn");
                    }
                    
                    mod.status = ATTACHED;
                }
                callback();
            }
            function addRelies(mod){
                var i, modName, reqName, m;//rqmap,spmap
                function reg2Map(modName){
                    rqmap[modName] = rqmap[modName] || {};
                    spmap[modName] = spmap[modName] || {};
                    return modName;
                }
                modName = reg2Map(mod.name);
                for (i = 0; i < mod.requires.length; i++) {
                    reqName = reg2Map(mod.requires[i]);
                    rqmap[modName][reqName] = 1;
                    spmap[reqName][modName] = 1;
                    for (n in spmap[modName]) {
                        rqmap[n][reqName] = 1;
                        spmap[reqName][n] = 1;
                    }
                }
            }
            mod = mods[modName];
            if (mod && mod.status !== INIT) {
                requires = mod.requires;
                if (S.iA(requires) && requires.length > 0) {
                    addRelies(mod);
                    if (rqmap[modName][modName]) {
                        throw new Error("Fatal Error,Loop Reqs:" + mod.name);
                    }
                    S.log(mod.name + " to req: " + requires);
                    S._aMs(requires, function(){
                        attachMod(mod);
                    });
                }
                else {
                    attachMod(mod);
                }
            }
            else {
                mod = {
                    name: modName
                };
                S._lM(mod, function(){
                    S._aM(modName, function(){
                        attachMod(mods[modName]);
                    });
                });
            }
        },
        _lM: function(mod, callback){
            var lq = S.Env._loadQueue, modName = mod.name, lo;
            var mods = S.Env.mods;
            if (lq[modName]) {
                lo = lq[modName];
                if (lo.c) {
                    S.log(modName + " is already loaded", "warn");
                    callback();
                }
                else {
                    S.log(modName + " is loading,listen to callback");
                    lo.fns.push(callback);
                }
            }
            else {
                S._gPath(mod, function(){
                    lq[modName] = {
                        fns: [callback],
                        c: false
                    };
                    if (!mods[modName]) {
                        mods[modName] = {
                            name: modName,
                            status: INIT
                        };
                    }                    
                    S.getScript(mod.fullpath, function(){
                        var i, lo = lq[modName], m;
                        if (S.__m__) {
                            m = S.__m__;
                            S.add(modName, m.fn, m.deps);
                            S.__m__ = null;
                        }
                        if (mods[modName].status === INIT) {
                            mods[modName].status = LOADED;
                        }
                        for (i = 0; i < lo.fns.length; i++) {
                            lo.fns[i]();
                        }
                        lo.c = true;
                        lo.fns = undefined;
                    }, null, {
                        mod_name: modName
                    });                    
                });
            }
        },
        path: function(s, callback){
            var pa = s.split("-"), pkgname = pa[0], packages = kslite_config.lt_pkgs;
            if (S.iS(packages[pkgname])) {
                callback(packages[pkgname] + pa.join("/"));
            }
            else {
                KSLITE.provide(["packages-router"], function(require){
                    var pr = require("packages-router");
                    callback((pr[pkgname] || S.Config.base) + pa.join("/"));
                });
            }
        },
        _gPath: function(mod, fn){
            S.path(mod.name, function(p){
                mod.fullpath = p + ".js?_t=" + kslite_config.lt_t + ".js";
                S.log("path " + mod.name + ": " + mod.fullpath);
                fn();
            });
        },
        multiAsync: function(asyncers, callback){
            var ctx, k, hasAsyncer = false;
            function isAllComplete(){
                var k, ro = {};
                for (k in asyncers) {
                    if (!asyncers[k].c) {
                        return;
                    }
                    ro[k] = asyncers[k].r;
                }
                callback(ro);
            }
            for (k in asyncers) {
                hasAsyncer = true;
            }
            if (!hasAsyncer) {
                callback({});
            }
            for (k in asyncers) {
                (function(){
                    var ao = asyncers[k];//{context:c,fn:f,args:a,result:r,iscomplete:c}
                    ao.f.call((ao.c || S), ao.a, function(data){
                        ao.r = data;
                        ao.c = true;
                        isAllComplete();
                    });
                })();
            }
            
        },
        _ns: function(names){
            var i, namesArr = names.split("-"), o = S.Env.fns;
            for (i = 0; i < namesArr.length; i++) {
                o[namesArr[i]] = o[namesArr[i]] || {};
                o = o[namesArr[i]];
            }
            return o;
        },
        require: function(modName){
            var modRoot = S._ns(modName);
            modRoot.exports = modRoot.exports || {};
            return modRoot.exports;
        },
        declare: function(){
            var interactiveScript, i, arg, id, depsArr, modFactory;
            for (i = 0; i < arguments.length; i++) {
                arg = arguments[i];
                if (S.iS(arg)) {
                    id = arg;
                }
                else 
                    if (S.iA(arg)) {
                        depsArr = arg;
                    }
                    else 
                        if (S.iF(arg)) {
                            modFactory = arg;
                        }
            }
            if (!id) {
                interactiveScript = getInteractiveScript();
                if (interactiveScript) {
                    id = interactiveScript.getAttribute("mod_name") || false;
                }
            }
            if (!id) {
                S.__m__ = {
                    deps: depsArr,
                    fn: function(S, exports, exportsParent){
                        modFactory(S.require, exports, exportsParent);
                    }
                };
            }
            else {
                S.add(id, function(S, exports, exportsParent){
                    modFactory(S.require, exports, exportsParent);
                }, depsArr);
            }
        },
        provide: function(modsArr, fn){
            S.use(modsArr.join(","), function(S){
                fn(S.require);
            });
        }
    });
    S._init();
})(window, 'KSLITE');
