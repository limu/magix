define(function(require, exports, module){
    var Mustache = require("mustache");
    var MxView = require("libs/magix/view");
    var vom = require("libs/magix/vom");
    var _ = require("underscore");
    var View = MxView.extend({
        init: function(o){
            this.bind("rendered", this.mountSubView);
        },
        queryModelChange: function(model){
            if (model.hasChanged("pathname")) {
                this.mountSubView();
            }
        },
        mountSubView: function(){
            vom.getElementById('vc-body').mountView("app/views" + this.queryModel.get('pathname'));
        }
    });
    return View;
});
