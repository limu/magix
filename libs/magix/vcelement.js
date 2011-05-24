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
        this.parentNode = null;
        if (node) {
            this.getOnce();
        }
    };
    _.extend(VCElement.prototype, Backbone.Events, {
        view: null,
        idIt: function(node, id){
            node.id = (node && node.id) || id || El.uniqueId();
            return node.id;
        },
        getOnce: function(){
            var node = this._node;
            if (!node) {
                console.warn("always get once");
            }
            this._node = null;
            return node;
        },
        mountView: function(viewMod, options){
            this.mounted = true;
            var oldViewMod = this.getAttribute("view_mod");
            if (viewMod) {
                this.setAttribute("view_mod", viewMod);
            }
            var self = this;
            if (viewMod && viewMod == oldViewMod) {
                this.view.queryModel.change();
            }
            else {
                if (this.view) {
                    this.view.destory();
                    this.view = null;
                }
                module.load(this.getAttribute("view_mod"), function(View){
                    options.vcid = self.id;
                    options.el = self.id;
                    options.mod = self.getAttribute("view_mode");
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
            console.log("VCELE UNMOUNT:2 unbind lisnter to querymodel TODO!! @" + this.view.modUri);
            console.log("VCELE UNMOUNT:3 inner dom unload @" + this.view.modUri);
            document.getElementById(this.view.vcid).innerHTML = "";
            console.log("VCELE UNMOUNT:4 unbind event delegation on vcelement TODO!!@" + this.id);
            console.log("VCELE UNMOUNT:5 chg vcelement.mounted to false @" + this.id);
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
