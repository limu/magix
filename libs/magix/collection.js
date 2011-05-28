define(function(require, exports, modules){
    var _ = require("underscore");
    return require("backbone").Collection.extend({
        initialize: function(){
            if (this.init) {
                this.init();
            }
        },
        parse: function(response){
            return response.data.list;
        }
    });
});
