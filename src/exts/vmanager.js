/*
    author:xinglie.lkf@taobao.com
    像gmail那样，view之间的切换使用隐藏的方式
 */
KISSY.add('exts/vmanager', function(S, VOM, Magix) {
    var VManager = function(ownerView, maxViews) {
        var me = this;
        me.$ownerView = ownerView;
        me.$viewsCache = Magix.cache(maxViews || 5, 2);
        me.id = S.guid();
    };
    VManager.prototype = {
        create: function(cId, id) {
            var me = this;
            var gid = 'magix_vf_' + me.id + '_' + id;
            me.$viewsCache.get(gid); //
            var vframe = VOM.get(gid);
            var fromCache = true;
            if (!vframe) {
                fromCache = false;
                var view = me.$ownerView;
                var tagName = Magix.config('tagName');
                var ownerNode = S.one('#' + cId);
                var node = document.createElement(tagName);
                node.id = gid;
                node.style.left = '-999999px';
                node.style.top = '-999999px';
                ownerNode.append(node);
                vframe = view.owner.mountVframe(gid);
                me.$viewsCache.set(gid, gid, function(key) {
                    var node = S.one('#' + key);
                    var vf = VOM.get(key);
                    if (vf) {
                        vf.unmountVframe();
                    }
                    if (node) {
                        node.remove();
                    }
                });
            }
            if (me.$lastest) {
                var last = S.one('#' + me.$lastest.id);
                if (last) {
                    last.css({
                        position: 'absolute'
                    });
                }
            }
            S.one('#' + vframe.id).css({
                position: 'static'
            });
            me.$lastest = vframe;
            return {
                fromCache: fromCache,
                vframe: vframe
            };
        },
        destroy: function(id) {
            var me = this;
            var gid = 'magix_vf_' + me.id + '_' + id;
            me.$viewsCache.del(gid);
            me.$lastest = null;
        }
    };
    return VManager;
}, {
    requires: ['magix/vom', 'magix/magix', 'node']
});