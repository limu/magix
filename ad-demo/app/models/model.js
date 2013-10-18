/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('app/models/model', function(S, Model, IO) {
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
            var url = this.get('url');
            IO({
                url: url,
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
    requires: ['mxext/model', 'ajax']
});