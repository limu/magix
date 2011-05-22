define(function(require){
    var Backbone = require("backbone");
    var View = Backbone.View.extend({
        initialize: function(o){
            this.options = o;
            this.vcid = o.vcid;
            this.queryModel = o.queryModel;
        },
        render: function(){
            var node = document.getElementById(this.vcid);
            node.innerHTML = this.queryModel.get("pathname");
        },
        destory: function(){
            var node = document.getElementById(this.vcid);
            node.innerHTML = "";
        }
    });
    return View;
});
