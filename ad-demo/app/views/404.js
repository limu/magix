/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('app/views/404', function(S, View) {
    return View.extend({
        render: function() {
            this.setViewHTML(this.template);
        }
    });
}, {
    requires: ['magix/view']
});