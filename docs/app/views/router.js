define(function(require){
    var Mustache = require("mustache");
    var MxView = require("magix/view");
    var _ = require("underscore");
    var Highlight = require("assets/highlight");
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
