/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/views/index', function(S, View, Magix) {
    return View.extend({
        render: function() {
            var me = this;
            me.setViewHTML(me.template);
        }
    });
}, {
    requires: ['magix/view', 'magix/magix']
});