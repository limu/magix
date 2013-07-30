/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
define('magix/magix', function() {
    var Slice = [].slice;

    var Include = function(path, mxext) {
        var mPath = seajs.data.paths[mxext ? 'mxext' : 'magix'];
        var url = mPath + path + ".js?r=" + Math.random() + '.js';
        var xhr = window.ActiveXObject || window.XMLHttpRequest;
        var r = new xhr('Microsoft.XMLHTTP');
        r.open('GET', url, false);
        r.send(null);
        return r.responseText;
    };
    eval(Include('../tmpl/magix'));
    var ToString = Object.prototype.toString;

    return mix(Magix, {
        include: Include,
        libRequire: function(name, fn) {
            if (name) {
                seajs.use(name, fn);
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
                appTag = Date.now();
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
            var o = {};
            o[appName] = appHome + appName + '/';
            seajs.config({
                paths: o
            });
        },
        isArray: $.isArray,
        isFunction: $.isFunction,
        isObject: function(o) {
            return ToString.call(o) == '[object Object]';
        },
        isString: function(str) {
            return ToString.call(str) == '[object String]';
        },
        isNumber: function(v) {
            return ToString.call(v) == '[object Number]';
        },
        isRegExp: function(r) {
            return ToString.call(r) == '[object RegExp]';
        },
        extend: function(ctor, base, props, statics) {
            ctor.superclass = base.prototype;
            var T = function() {};
            T.prototype = base.prototype;
            ctor.prototype = new T();
            Magix.mix(ctor.prototype, props);
            Magix.mix(ctor, statics);
            ctor.prototype.constructor = ctor;
            return ctor;
        }
    });
});