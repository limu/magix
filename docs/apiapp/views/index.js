/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/views/index', function(S, View, Magix) {
    return View.extend({
        render: function() {
            var me = this;
            var loc = me.location;
            var pathname = loc.pathname;
            var pns = pathname.split('/');
            var flag = pns.pop();
            var
        }
    });
}, {
    requires: ['magix/view', 'magix/magix']
});