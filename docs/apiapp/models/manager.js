/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/models/manager', function(S, MManager, Model) {
    var MM = MManager.create(Model);
    MM.registerModels([{
        name: 'Class_List',
        url: 'index.json',
        cache: true,
        after: function(m) {
            var list = m.get('list');
            var coreList = [];
            var extList = [];
            for (var i = 0, e; i < list.length; i++) {
                e = list[i];
                if (e.isCore) {
                    coreList.push(e);
                } else {
                    extList.push(e);
                }
            }
            m.set('coreList', coreList);
            m.set('extList', extList);
        }
    }]);
    return MM;
}, {
    requires: ['mxext/mmanager', 'apiapp/models/model']
});