/**
 * @fileOverview view类
 * @author 行列
 * @version 1.0
 */
define('magix/view', ["magix/magix", "magix/event", "magix/body"], function(Magix, Event, Body) {

    eval(Magix.include('../tmpl/view'));
    var AppRoot;
    var Suffix = '?t=' + Date.now();

    /* var ProcessObject = function(props, proto, enterObject) {
        for (var p in proto) {
            if (Magix.isObject(proto[p])) {
                if (!Has(props, p)) props[p] = {};
                ProcessObject(props[p], proto[p], 1);
            } else if (enterObject) {
                props[p] = proto[p];
            }
        }
    };*/


    var Tmpls = {}, Locker = {};
    View.prototype.fetchTmpl = function(fn) {
        var me = this;
        var hasTemplate = 'template' in me;
        if (!hasTemplate) {
            if (Has(Tmpls, me.path)) {
                fn(Tmpls[me.path]);
            } else {
                var idx = me.path.indexOf('/');
                if (!AppRoot) {
                    var name = me.path.substring(0, idx);
                    AppRoot = require.s.contexts._.config.paths[name];
                }
                var path = me.path.substring(idx + 1);
                var file = AppRoot + path + '.html';

                var l = Locker[file];
                var onload = function(tmpl) {
                    fn(Tmpls[me.path] = tmpl);
                };
                if (l) {
                    l.push(onload);
                } else {
                    l = Locker[file] = [onload];
                    $.ajax({
                        url: file + Suffix,
                        success: function(x) {
                            SafeExec(l, x);
                            delete Locker[file];
                        },
                        error: function(e, m) {
                            SafeExec(l, m);
                            delete Locker[file];
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
        };
        BaseView.extend = me.extend;
        return Magix.extend(BaseView, me, props, statics);
    };
    return View;
});