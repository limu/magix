KISSY.add('app/views/partials/footer', function(S, View) {
    return View.extend({
        init: function(extra) {
            this.extra = extra;
        },
        render: function() {
            var me = this;
            me.setViewHTML(me.template.replace(/{{year}}/g, new Date().getFullYear()));
        }
    });
}, {
    requires: ['mxext/view', 'brix/gallery/footer/index.css']
});