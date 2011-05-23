define(function(require,exports,module){
    var Backbone = require("backbone");
    var Templates = require("app/resources/templates");
    var vom = require("libs/magix/vom");
    var MxView = Backbone.View.extend({
        initialize: function(o){
            var self = this;
            this.options = o;
            this.vcid = o.vcid;
            this.queryModel = o.queryModel;
            this.init();			
            this.bind("rendered", function(){
                var vc = vom.getElementById(this.vcid);
                var childVcs = vc.getElements();
                var i, child;
                for (i = 0; i < childVcs.length; i++) {
                    child = vom.createElement(childVcs[i]);
                    vc.appendChild(child);
                    child.render(null, {
                        queryModel: this.queryModel
                    });
                }
            });
            this.getTemplate(function(data){
                self.template = data;
                self.render();
                self.trigger("rendered");
            });
            
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
