define(function(require, exports, module){
    var Backbone = require("backbone");
    var Mustache = require("mustache");
    var MxView = require("libs/magix/view");
    var vom = require("libs/magix/vom");
    var View = MxView.extend({
        render: function(){
            var node = document.getElementById(this.vcid);
            node.innerHTML = Mustache.to_html(this.template, this.queryModel.toJSON());
            this.rendered = true;
        },
		queryModelChange:function(model){
			var node = document.getElementById(this.vcid);
			node.innerHTML = node.innerHTML + " => " + model.get("query");
		}
    });
    return View;
});
