/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/views/partials/menus', function(S, View) {
    return View.extend({
        render: function() {
            var me = this;
            me.setViewHTML(me.template);
        }
    });
}, {
    requires: ['mxext/view']
});