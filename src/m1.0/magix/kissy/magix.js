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
    eval(Include('../tmpl/magix'));
    return mix(Magix, {
        include: Include,
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
        isArray: S.isArray,
        isFunction: S.isFunction,
        isObject: S.isObject,
        isRegExp: S.isRegExp,
        isString: S.isString,
        isNumber: S.isNumber
    });
});