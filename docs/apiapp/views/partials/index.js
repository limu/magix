/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/views/partials/index', function(S, View) {
    return View.extend({
        render: function() {
            this.setViewHTML(this.template);
        }
    });
}, {
    requires: ['mxext/view']
});