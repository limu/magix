/**
 * @fileOverview view类
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/view', function(S, Magix, Event, Body, IO) {

    eval(Magix.include('../tmpl/view'));
    var AppRoot = Magix.config('appRoot');
    var Suffix = Magix.config('debug') ? '?t=' + S.now() : '';

    /*var ProcessObject = function(props, proto, enterObject) {
        for (var p in proto) {
            if (S.isObject(proto[p])) {
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
                var file = AppRoot + me.path + '.html';
                var l = Locker[file];
                var onload = function(tmpl) {
                    fn(Tmpls[me.path] = tmpl);
                };
                if (l) {
                    l.push(onload);
                } else {
                    l = Locker[file] = [onload];
                    IO({
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
            fn(tmpl);
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
        return S.extend(BaseView, me, props, statics);
    };

    return View;
}, {
    requires: ['magix/magix', 'magix/event', 'magix/body', 'ajax']
});