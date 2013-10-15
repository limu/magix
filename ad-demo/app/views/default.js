/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('app/views/default', function(S, View, Magix, VOM) {
    return View.extend({
        render: function() {
            this.setViewHTML(this.template);
            this.mountMainFrame();
        },
        locationChange: function(e) {
            if (e.changed.isPathname()) {
                this.mountMainFrame();
            }
        },
        mountMainFrame: function() {
            var pathname = this.location.pathname;
            var pns = pathname.split('/');
            pns.shift();
            if (pns[0] == 'home') {
                pns.unshift('partials'); //home放在partials文件夹中
            }
            var viewPath = 'app/views/' + pns.join('/');
            var vframe = VOM.get('magix_vf_main');
            vframe.mountView(viewPath);
        }
    });
}, {
    requires: ['magix/view', 'magix/magix', 'magix/vom']
});