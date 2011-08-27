define(function(require, exports, module){
    var Mustache = require("mustache");
    var MxView = require("magix/view");
    var vom = require("magix/vom");
    var _ = require("underscore");
    var View = MxView.extend({
        init: function(o){
            this.bind("rendered", this.mountSubView);
        },
        queryModelChange: function(model){
            if (model.hasChanged("pathname")) {
                this.mountSubView();
            }
			return false;
        },
        mountSubView: function(){
            vom.getElementById('vc-body').mountView("app/views" + this.queryModel.get('pathname'));
        }
    });
    return View;
});
