/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/1.0events', function(S, View, Magix, Body) {
    var EvtInfoCache = Magix.cache(40);
    var SafeExec = Magix.safeExec;
    var Mix = Magix.mix;
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
    return View.mixin({
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
                    var eventsTypes = events[e.st];
                    if (eventsTypes) {
                        var fn = eventsTypes[m.n];
                        if (fn) {
                            var tfn = WEvent[m.f];
                            if (tfn) {
                                tfn.call(WEvent, domEvent);
                            }
                            SafeExec(fn, Mix({
                                currentId: e.cId,
                                targetId: e.tId,
                                type: e.st,
                                view: me,
                                domEvent: domEvent,
                                params: m.p
                            }, WEvent), eventsTypes);
                        }
                    }
                }
            }
        },
        delegateEvents: function(isDestroy) {
            var me = this;
            var events = me.events;
            var fn = isDestroy ? Body.un : Body.on;
            var vom = me.vom;
            for (var p in events) {
                fn.call(Body, p, vom);
            }
        }
    });
}, {
    requires: ['magix/view', 'magix/magix', 'magix/body']
});