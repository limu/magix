KISSY.add('app/views/brixes/tip', function(S, View) {
    return View.extend({
        init: function(extra) {
            this.extra = extra;
        },
        render: function() {
            var me = this;
            me.setViewHTML(me.template);
        }
    });
}, {
    requires: ['mxext/view']
});