/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('app/models/manager', function(S, MManager, Model) {
    var MM = MManager.create(Model);
    MM.registerModels([{
        name: 'Table_Sortable_Data',
        url: 'api/table-sortable-data.json',
        cache: true
    }]);
    return MM;
}, {
    requires: ['mxext/mmanager', 'app/models/model']
});