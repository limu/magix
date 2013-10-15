/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/views/partials/search', function(S, View, MM) {
    return View.extend({
        render: function() {
            this.setViewHTML(this.template);
        },
        'doSearch<keyup>': function(e) {
            var me = this;
            var last = me.$last;
            var val = me.$(e.currentId).value;
            if (last != val) {
                me.$last = val;
                if (me.$lastSearch) {
                    me.$lastSearch.stop();
                }
                if (val) {
                    me.$lastSearch = MM.searchInfos(val, function(e, m) {
                        var vf = me.vom.get('J_apiapp_s_result');
                        if (vf) {
                            vf.invokeView('showResults', e, m);
                        }
                    }, me);
                } else {
                    console.log('nothing');
                }
            }
        },
        'showSearch<focusin>': function(e) {
            this.$('abc').style.display = 'block';
            this.$('J_apiapp_s_result').style.display = 'block';
            this['doSearch<keyup>'](e);
        },
        'hideSearch<mousedown>': function(e) {
            this.$('abc').style.display = 'none';
            this.$('J_apiapp_s_result').style.display = 'none';
        }
    });
}, {
    requires: ['mxext/view', 'apiapp/models/manager']
});