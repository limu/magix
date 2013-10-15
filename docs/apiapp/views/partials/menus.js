/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/views/partials/menus', function(S, View, MM, Mustache, Magix) {
    return View.extend({
        render: function() {
            var me = this;
            me.setViewHTML(me.template);
            MM.fetchAll({
                name: 'Class_List'
            }, function(e, m) {
                if (e) {
                    me.setViewHTML(e.msg);
                } else {
                    var html = Mustache.render(me.template, {
                        coreList: m.get('coreList'),
                        extList: m.get('extList'),
                        infos: Magix.local('APIPathInfo')
                    });
                    me.setViewHTML(html);
                }
            }, me);
        }
    });
}, {
    requires: ['mxext/view', 'apiapp/models/manager', 'apiapp/helpers/mustache', 'magix/magix']
});