define(function(require, exports, module){
    var Backbone = require("backbone");
    var Mustache = require("mustache");
    var MxView = require("libs/magix/view");
    var View = MxView.extend({
        init: function(o){
            this.modUri = module.uri;
        },
        render: function(){
            var node = document.getElementById(this.vcid);
            node.innerHTML = Mustache.to_html(this.template, this.queryModel.toJSON());
			this.rendered = true;
        },
        dest: function(){
            var node = document.getElementById(this.vcid);
            node.innerHTML = "";
        }
    });
    return View;
});
