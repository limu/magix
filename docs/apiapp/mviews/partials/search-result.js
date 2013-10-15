/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/mviews/partials/search-result', function(S, View) {
    return View.extend({
        render: function() {
            this.setViewHTML(this.template);
        },
        showResults: function(err, result) {
            this.setViewHTML(this.template + result.nsGrouped.length);
        }
    });
}, {
    requires: ['mxext/view']
});