define(function(require, exports, module){
    var Backbone = require("backbone");
    var Mustache = require("mustache");
    var MxView = require("libs/magix/view");
    var vom = require("libs/magix/vom");
    var View = MxView.extend({
        init: function(o){
            this.modUri = module.uri;
        },
        render: function(){
            var node = document.getElementById(this.vcid);
            node.innerHTML = Mustache.to_html(this.template, this.queryModel.toJSON());
            this.rendered = true;
        },
		queryModelChange:function(model){
			//这个事件由父mxvcElement传递下来,model依然是改变状态(包含新值,旧值)的QM.
			var node = document.getElementById(this.vcid);
			node.innerHTML = node.innerHTML + " => " + model.get("query");
		}
    });
    return View;
});
