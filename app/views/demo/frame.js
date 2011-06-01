define(function(require, exports, module){
    var Backbone = require("backbone");
    var Mustache = require("mustache");
    var MxView = require("libs/magix/view");
    var vom = require("libs/magix/vom");
    var _ = require("underscore");
    var View = MxView.extend({
        init: function(o){
            this.bind("rendered", this.mountMainView);
        },
		render: function(){
            var node = document.getElementById(this.vcid);
            node.innerHTML = Mustache.to_html(this.template, this.queryModel.toJSON());
            this.rendered = true;
        },
        mountMainView: function(){
            vom.root.childNodes[0].mountView("app/views" + this.queryModel.get("pathname"), {
                queryModel: this.queryModel
            });
        },        
        queryModelChange: function(model){
            if (model.hasChanged("pathname")) {
                this.mountMainView();
                return false;
            }
            else {
                return true;
            }
        }
    });
    return View;
});
