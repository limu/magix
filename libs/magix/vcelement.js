/**
 * Magix ViewContainer节点元素
 * @module vcelement
 * @requires underscore,backbone,libs/magix/controller
 * @require.asynces libs/magix/vom
 */
/**
 * ViewContainer节点元素,对应一个HTMLElement,可以通过mount,unMount将Magix View渲染至这个节点内.
 * @class Vcelement
 * @namespace libs.magix
 * @constructor
 * @param {HTMLElement} node (可选)View根节点
 * @param {String} id (可选)View根节点id 
 */
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
        this.mounting = false;
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
                node.id = node.id || VCElement.uniqueId();
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
            this.mounting = true;
            if (this.view) {
                this.view.destory();
                this.view = null;
            }
            (module.load || require.async)(viewName, function(View){
                options.vcid = self.id;
                options.el = self.id;
                options.id = self.id;
                options.viewName = viewName;
                self.view = new View(options);
                if (options.message && typeof options.message == 'function') {
                    self.view.bind("message", options.message);
                }
                if (self.view.rendered) {
                    this.mounting = false;
                    this.mounted = true;
                    self.trigger("mounted", self.view);
                }
                else {
                    self.view.bind("rendered", function(){
                        this.mounting = false;
                        this.mounted = true;
                        self.trigger("mounted", self.view);
                    });
                }
                if (!window.MXRootView) {//TODO delete
                    window.MXRootView = self.view;
                }
            });
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
            if (this.mounted) {
                this.unmountView();
            }
            
            console.log("VCELE DESTORY:2 remove mxvc dom element @" + this.id);
            var node = document.getElementById(this.id);
            node.parentNode.removeChild(node);
            if (this.linkid) {
                node = document.getElementById(this.linkid);
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
            console.log("VCELE UNMOUNT:3 unbind event delegation on vcelement @" + this.id);
            if (this.view.events) {
                var node = document.getElementById(this.id);
                for (var eventType in this.view.events) {
                    node["on" + eventType] = null;
                }
                node = null;
            }
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
