/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/models/model', function(S, Model, IO, Magix) {
    return Model.extend({
        parse: function(resp) {
            if (S.isArray(resp)) {
                return {
                    list: resp
                };
            }
            return resp;
        },
        sync: function(callback) {
            var pathInfos = Magix.local('APIPathInfo');
            var url = this.get('url');
            var path = pathInfos.loader + '/' + pathInfos.ver + '/';
            if (url) {
                path += url;
            } else {
                var cName = this.get('cName') || pathInfos.action;
                path += 'symbols/' + cName + '.json';
            }
            IO({
                url: path,
                dataType: 'json',
                success: function(data) {
                    callback(null, data);
                },
                error: function(xhr, msg) {
                    callback(msg);
                }
            });
        }
    });
}, {
    requires: ['mxext/model', 'ajax', 'magix/magix']
});