define(function(require, exports, module){
    var VCTAG = "mxvc";
    //hack for custom tag for ie
    var mxview = document.createElement(VCTAG);
    mxview = null;
    var _ = require("underscore");
    var Backbone = require("backbone");
    var VCElement = function(node, id){
        this._node = node || document.createElement(VCTAG);
        this.id = this.idIt(this._node, id);
        this.childNodes = [];
        this.mounted = false;
        this.isLink = false;
        this.parentNode = null;
        if (node) {
            this.freeNode();
        }
    };
    _.extend(VCElement.prototype, Backbone.Events, {
        view: null,
        idIt: function(node, id){
            var tid, vn, tnode;
            if (node && node.getAttribute("link_to")) {
                tid = node.getAttribute("link_to");
                tnode = document.getElementById(tid);
                vn = node.getAttribute("view_name");
                if (tnode && vn) {
                    tnode.setAttribute("view_name", vn);
                }
                node.id = VCElement.uniqueId();
                this.isLink = true;
                this.linkid = node.id;
                return tid;
            }
            node.id = (node && node.id) || id || VCElement.uniqueId();
            return node.id;
        },
        getOnce: function(){
            var node = this._node;
            if (!node) {
                console.warn("always get once");
            }
            this.freeNode();
            return node;
        },
        freeNode: function(){
            this._node = null;
        },
        mountView: function(viewName, options){
            options = options ||
            {
                queryModel: require("./controller").queryModel
            };
            if (!viewName) {
                return;
            }
            var self = this;
            this.mounted = true;
            if (this.view) {
                this.view.destory();
                this.view = null;
            }
            module.load(viewName, function(View){
                options.vcid = self.id;
                options.el = self.id;
                options.viewName = viewName;
                self.view = new View(options);
                if (!window.MXRootView) {//TODO delete
                    window.MXRootView = self.view;
                }
            });
        },
        mountViewOld: function(viewName, options){
            this.mounted = true;
            var oldViewName = this.getAttribute("view_name");
            if (viewName) {
                this.setAttribute("view_name", viewName);
            }
            var self = this;
            if (viewName && viewName == oldViewName) {
                this.view.queryModel.change();
            }
            else {
                if (this.view) {
                    this.view.destory();
                    this.view = null;
                }
                module.load(this.getAttribute("view_name"), function(View){
                    options.vcid = self.id;
                    options.el = self.id;
                    options.viewName = self.getAttribute("view_name");
                    self.view = new View(options);
                    if (!window.MXRootView) {//TODO delete
                        window.MXRootView = self.view;
                    }
                });
            }
        },
        getAttribute: function(s){
            var node = document.getElementById(this.id);
            return node.getAttribute(s) || "";
        },
        setAttribute: function(k, v){
            var node = document.getElementById(this.id);
            return node.setAttribute(k, v);
        },
        getElements: function(){
            var node = document.getElementById(this.id);
            var nodes = node.getElementsByTagName(VCTAG);
            var i, res = [];
            for (i = 0; i < nodes.length; i++) {
                res.push(this.idIt(nodes[i]));
            }
            return res;
        },
        appendChild: function(c){
            //this.childNodes = this.childNodes ||[];
            this.childNodes.push(c);
            c.parentNode = this;
        },
        removeNode: function(){
            console.log("VCELE DESTORY:1 unmount current view @" + this.id);
            this.unmountView();
            console.log("VCELE DESTORY:2 remove mxvc dom element @" + this.id);
            var node = document.getElementById(this.id);
            node.parentNode.removeChild(node);
            if (this.linkid) {
                node = document.getElementById(linkid);
                node.parentNode.removeChild(node);
            }
            node = null;
            console.log("VCELE DESTORY:3 remove self(vcelement) from vom @" + this.id);
            this.parentNode.removeChild(this);
        },
        removeChild: function(child){
            //TODO strengthen removeChild for single call(not by removeNode);
            //			if(child.mounted){
            //				child.unmountView();
            //			}
            var i, n, newChildNodes = [];
            for (i = 0; i < this.childNodes.length; i++) {
                n = this.childNodes[i];
                if (n == child) {
                    module.load("./vom", function(vom){
                        vom.pop(n);
                    });
                }
                else {
                    newChildNodes.push(n);
                }
            }
            this.childNodes = newChildNodes;
        },
        unmountView: function(){
            console.log("VCELE UNMOUNT:1 fire view's unload @" + this.view.modUri);
            this.view.trigger("unload");
            console.log("VCELE UNMOUNT:2 inner dom unload @" + this.view.modUri);
            document.getElementById(this.view.vcid).innerHTML = "";
            console.log("VCELE UNMOUNT:3 unbind event delegation on vcelement TODO!!@" + this.id);
            console.log("VCELE UNMOUNT:4 chge vcelement.mounted to false @" + this.id);
            this.mounted = false;
        }
    });
    _.extend(VCElement, {
        uniqueId: function(){
            return _.uniqueId("vc-");
        }
    });
    return VCElement;
});
