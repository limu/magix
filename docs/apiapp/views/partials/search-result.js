/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/views/partials/search-result', function(S, View) {
    return View.extend({
        render: function() {
            this.setViewHTML(this.template);
        },
        showResults: function(err, model) {
            console.log(err, model);
        }
    });
}, {
    requires: ['mxext/view']
});