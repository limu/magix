/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/views/default', function(S, View, Magix) {
    return View.extend({
        render: function() {
            var me = this;
            me.setViewHTML(me.template);
            var loc = me.location;
            var pathname = loc.pathname;
            var pns = pathname.split('/');

            var loader = pns[1];
            var ver = pns[2];
            var tmpl = pns[3];
            var data = pns[4];
            if (!data && tmpl == 'index') {
                data = 'index';
            } else {
                data = 'symbols/' + data;
            }

            Magix.local('APInfo', {
                loader: loader,
                ver: ver,
                data: data
            });
        }
    });
}, {
    requires: ['magix/view', 'magix/magix']
});