/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/models/model', function(S, Model, IO, Router) {
    return Model.extend({
        parse: function(resp) {
            if (S.isArray(resp)) {
                return {
                    list: resp
                };
            }
            return resp;
        },
        sync: function(callback, options) {
            console.log(Router.parseQH(null, 1));
            IO({
                url: this.get('url'),
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
    requires: ['mxext/model', 'ajax', 'magix/router']
});