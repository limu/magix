/*
    扩展路由示例，仅KISSY版
 */
KISSY.add('mxext/router', function(S, R, E, View) {
    var W = window;
    R.useState = function() {
        var me = this,
            initialURL = location.href;
        var lastHref = initialURL;
        var newHref;
        E.on(W, 'popstate', function(e) {
            newHref = location.href;
            var equal = newHref == initialURL;
            if (!me.poped && equal) return;
            me.poped = 1;
            if (newHref != lastHref) {
                e = {
                    backward: function() {
                        e.p = 1;
                        history.replaceState(S.now(), document.title, lastHref);
                        me.fire('change:backward');
                    },
                    forward: function() {
                        e.p = 1;
                        lastHref = newHref;
                        me.route();
                    },
                    prevent: function() {
                        e.p = 1;
                        me.fire('change:prevent');
                    },
                    location: me.parseQH(newHref)
                };
                me.fire('change', e);
                if (!e.p) {
                    e.forward();
                }
            }
        });
    };
    R.useHash = function() {
        var me = this,
            lastHash = me.parseQH().srcHash;
        var newHash;
        E.on(W, 'hashchange', function(e, loc) {
            loc = me.parseQH();
            newHash = loc.srcHash;
            if (newHash != lastHash) {
                e = {
                    backward: function() {
                        e.p = 1;
                        location.hash = '#!' + lastHash;
                        me.fire('change:backward');
                    },
                    forward: function() {
                        e.p = 1;
                        lastHash = newHash;
                        me.route();
                    },
                    prevent: function() {
                        e.p = 1;
                        me.fire('change:prevent');
                    },
                    location: loc
                };
                me.fire('change', e);
                if (!e.p) {
                    e.forward();
                }
            }
        });
    };
    /**
     * 页面改变后的提示
     * @param  {Function} changedFun 是否发生改变的回调方法
     * @param  {String}  tipMsg       提示信息
     */
    View.prototype.observePageChange = function(changedFun, tipMsg) {
        var me = this;
        var changeListener = function(e) {
            if (changedFun.call(me)) {
                if (!me.$waitPC) {
                    me.$waitPC = true;
                    if (W.confirm(tipMsg)) {
                        delete me.$waitPC;
                        e.forward();
                    } else {
                        delete me.$waitPC;
                        e.backward();
                    }
                } else {
                    e.prevent();
                }
            }
        };
        R.on('change', changeListener);
        W.onbeforeunload = function(e) {
            if (changedFun.call(me)) {
                e = e || W.event;
                if (e) e.returnValue = tipMsg;
                return tipMsg;
            }
        };

        me.on('destroy', function() {
            R.un('change', changeListener);
            W.onbeforeunload = null;
        });
    };
}, {
    requires: ['magix/router', 'event', 'magix/view']
});