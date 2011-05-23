define(function(require, exports, module){
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
                    child.mountView(null, {
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
            var vcQueue, i;
            console.log("VIEW DESTORY:1.begin unmount view @" + this.modUri);
            vcQueue = this.getDestoryQueue();
            console.log("VIEW DESTORY:3.destory vcelement from the end of the queue util this vcelement total " + (vcQueue.length - 1) + " vcelements @" + this.modUri);
            for (i = vcQueue.length - 1; i > 0; i--) {
                vcQueue[i].removeNode();
            }
            console.log("VIEW DESTORY:4.unmount reference vcelement @" + this.modUri);
            var root = vom.getElementById(this.vcid);
            root.unmountView();
            //this.dest();
            this.queryModel.unbind();
            console.log("VIEW DESTORY:5.destory view complete OK!! @" + this.modUri);
        },
        getDestoryQueue: function(){
            var queue = [];
            var root = vom.getElementById(this.vcid);
            function rc(e){
                var i;
                queue.push(e);
                for (i = 0; i < e.childNodes.length; i++) {
                    rc(e.childNodes[i]);
                }
            }
            rc(root);
            console.log("VIEW DESTORY:2.depth traversal all vcelements @" + this.modUri);
            return queue;
        }
    });
    
    return MxView;
});
