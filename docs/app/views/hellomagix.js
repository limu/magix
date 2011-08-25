define(function(require){
    // return require("libs/magix/view").extend({});
    var Mustache = require("libs/mustache");
    var MxView = require("libs/magix/view");
    var _ = require("libs/underscore");
	var Highlight=require("assets/highlight");
    var View = MxView.extend({
        render: function(){
            var node = document.getElementById(this.vcid);
            node.innerHTML = Mustache.to_html(this.template, this.queryModel.toJSON());
			Highlight.init();
            this.rendered = true;
        }
    });
    return View;
});
