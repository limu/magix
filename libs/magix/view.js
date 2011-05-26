define(function(require, exports, module){
    var Backbone = require("backbone");
    var Templates = require("app/resources/templates");
    var vom = require("./vom");
    var _ = require("underscore");
    var ctrl = require("./controller");
    var helper = require("./helper");
    var MxView = Backbone.View.extend({
        initialize: function(o){
            var self = this;
            this.subViewsChange = [];
            this.options = o;
            this.vcid = o.vcid;
            this.queryModel = o.queryModel;
            this.viewName = o.viewName;
            this.bind("rendered", function(){
                var vc = vom.getElementById(this.vcid);
                var childVcs = vc.getElements();
                var i, child;
                for (i = 0; i < childVcs.length; i++) {
                    child = vom.createElement(childVcs[i]);
                    vc.appendChild(child);
                    child.mountView(child.getAttribute("view_name"), {
                        queryModel: this.queryModel
                    });
                }
            });
            
            var vc = vom.getElementById(this.vcid);
            if (vc == vom.root) {
                this.queryModel.bind("change", function(){
                    console.log("QM CHANG: Root View Query change " + self.viewName);
                    var res = self.queryModelChange(this);
                    self._changeChain(res, this);
                });
            }
			if(this.init){
				 this.init();
			}
            this.getTemplate(function(data){
                self.template = data;
                var autoRendered = self.render();
                if (autoRendered !== false) {
                    self.trigger("rendered");
                }
            });
            
        },
        _queryModelChange: function(model){
            console.log("QM CHANG: Sub View Query change" + this.viewName);
            var res = this.queryModelChange(model);
            this._changeChain(res, model);
        },
        _changeChain: function(res, model){
            var vcs = [], i;
            var vc = vom.getElementById(this.vcid);
            if (res === false) {
                return;
            }
            if (res === true || res === undefined) {
                vcs = vc.childNodes;
            }
            else 
                if (_.isArray(res)) {
                    vcs = res;
                }
            for (i = 0; i < vcs.length; i++) {
                vcs[i].view._queryModelChange(model);
            }
        },
        queryModelChange: function(){
        
        },
        render: function(){
        
        },
        refresh: function(){
        
        },
        getTemplate: function(cb, name){
            var url = ctrl.env.appHome + this.viewName;
            if (name) {
                url = url + "." + "name" + ".mu";
            }
            else {
                url = url + ".mu";
            }
            helper.getTemplate(url, function(data){
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
            //this.queryModel.unbind();
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
