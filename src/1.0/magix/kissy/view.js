/**
 * @fileOverview view类
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/view', function(S, Magix, Event, Body, IO) {

    eval(Magix.include('../tmpl/view'));
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