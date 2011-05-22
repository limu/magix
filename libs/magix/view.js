define(function(require){
    var Backbone = require("backbone");
    var Templates = require("app/resources/templates");
    var MxView = Backbone.View.extend({
        initialize: function(o){
            this.options = o;
            this.vcid = o.vcid;
            this.queryModel = o.queryModel;
            this.init();
        },
        render: function(){
        
        },
        refresh: function(){
        
        },
        getTemplate: function(cb, name){
            var url = this.modUri.split(".js")[0] + ".mu";
            if (name) {
                url = this.modUri.split(".js")[0] + "." + "name" + ".mu";
            }
            else {
                url = this.modUri.split(".js")[0] + ".mu";
            }
            Templates.getTemplate(url, function(data){
                cb(data);
            });
        },
        destory: function(){
            this.dest();
            this.queryModel.unbind();
        }
    });
    
    return MxView;
});
