define(function(require, exports, modules){
    var _ = require("underscore");
    return require("backbone").Collection.extend({
        initialize: function(models, options){
            this.queryKeys = (options && options.queryKeys) || [];
            if (this.init) {
                this.init(models, options);
            }
        },
        parse: function(response){
            return response.data.list;
        },
		getParam:function(){
			var k = "", qo = {}, ctrl = require("libs/magix/controller");
            var qm = ctrl.queryModel.toJSON();
            for (var i = 0; i < this.queryKeys.length; i++) {
                k = this.queryKeys[i];
                if (k in qm) {
                    qo[k] = qm[k];
                }
            }
			return ctrl.param(qo);
		}
    });
});
