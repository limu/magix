define(function(require, exports, module){
    var Backbone = require("backbone");
    var Mustache = require("mustache");
    var MxView = require("libs/magix/view");
    var vom = require("libs/magix/vom");
    var View = MxView.extend({
        init: function(o){
            this.modUri = module.uri;
            var self = this;
            this.queryModel.bind("change", function(){
				console.log("colors change");
                var vc = vom.getElementById(self.vcid);
//                if (self.rendered) {
//                    if (self.queryModel.get("a")) {
//                        vc.childNodes[0].render("app/views/colors/inner", {
//                            queryModel: self.queryModel
//                        });
//                    }
//                    else {
//                        vc.childNodes[0].render("app/views/colors/mid", {
//                            queryModel: self.queryModel
//                        });
//                    }
//                }
            });
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
