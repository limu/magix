/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/default', function(S, View, Magix, VOM, Router) {
    return View.extend({
        render: function() {
            var me = this;
            me.setViewHTML(me.template);
            me.mountMainVframe();
        },
        mountMainVframe: function() {
            var pnReg = /\/([^\/]+)\/(\d+\.\d+)\/([^\/]+)/;
            var loc = this.location;
            var infos = loc.pathname.match(pnReg);
            if (infos) {
                Magix.local('APIPathInfo', {
                    loader: infos[1],
                    ver: infos[2],
                    action: infos[3]
                });
                var vf = VOM.get('magix_vf_main');
                var view = infos[3] == 'index' ? infos[3] : 'class';
                vf.mountView('apiapp/mviews/partials/' + view);
            } else {
                Router.navigate('/home');
            }
        },
        locationChange: function() {
            this.mountMainVframe();
        }
    });
}, {
    requires: ['magix/view', 'magix/magix', 'magix/vom', 'magix/router']
});