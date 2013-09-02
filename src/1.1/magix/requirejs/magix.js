/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
define('magix/magix', function() {

    var Include = function(path, mxext) {
        var mPath = require.s.contexts._.config.paths[mxext ? 'mxext' : 'magix'];
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
            if (!Magix.isArray(name)) {
                name = [name];
            }
            if (name) {
                require(name, fn);
            } else if (fn) {
                fn();
            }
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
            base.prototype.constructor = base;
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