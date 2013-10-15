/*
    author:xinglie.lkf@taobao.com
    页面切换时间统计插件，在log方法内记录页面切换的用时
 */
KISSY.add('app/statistics', function(S, Router, VOM, Magix) {
    var MS = window.MS || {
        start: new Date()
    };
    window.MS = MS;
    var Statistics = {
        log: function(info) {
            console.log(info, info.end - info.start);
        }
    };

    var resume = function(rootVf) {
        rootVf.on('created', function() {
            var ph = Router.parseQH();
            var pn = ph.pathname;
            var begin = MS[pn];
            if (begin) {
                if (!begin.discard) {
                    Statistics.log({
                        start: begin.start,
                        end: new Date(),
                        action: begin.action,
                        from: begin.from,
                        cache: begin.cache,
                        pathname: pn,
                        to: begin.to
                    });
                }
            } else {
                Statistics.log({
                    action: 'load',
                    start: MS.start,
                    end: new Date(),
                    pathname: pn
                });
            }
            MS[pn] = {
                discard: true
            };
        });

        Router.on('changed', function(e) {
            if (!e.force) {
                var loc = e.location;
                var cache = !! MS[loc.pathname];
                if (cache) {
                    cache.discard = true;
                }
                var changed = e.changed;
                if (changed.isPathname()) {
                    MS[loc.pathname] = {
                        start: new Date(),
                        cache: cache,
                        action: 'pathnamechange',
                        from: changed.pathname.from,
                        to: changed.pathname.to
                    };
                } else if (!changed.isView()) { //params
                    MS[loc.pathname] = {
                        start: new Date(),
                        cache: cache,
                        action: 'paramschange'
                    };
                }
            }
        }, 0);
    };
    var rootVfId = Magix.config('rootId');
    var rootVf = VOM.get(rootVfId);
    var vfAdd = function(e) {
        if (e.vframe.id == rootVfId) {
            resume(e.vframe);
            VOM.un('add', vfAdd);
        }
    };
    if (!rootVf) {
        VOM.on('add', vfAdd);
    } else {
        resume(rootVf);
    }

    return Statistics;

}, {
    requires: ['magix/router', 'magix/vom', 'magix/magix']
});