KISSY.add('app/views/brixes/tip', function(S, View) {
    return View.extend({
        init: function(extra) {
            this.extra = extra;
        },
        render: function() {
            var me = this;
            me.renderByPagelet();
        },
        'changeValue<click>': function(e) {
            var pagelet = this.getManaged('pagelet');
            if (pagelet) {
                var tooltip = pagelet.getBrick('tooltip');
                if (tooltip) {
                    tooltip.set('content', '我是测试tooltip_tl_bl，改变啦');
                }
            }
        }
    });
}, {
    requires: ['mxext/view', 'brix/gallery/tooltip/index.css']
});