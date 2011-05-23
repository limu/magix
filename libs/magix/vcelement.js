define(function(require, exports, module){
    var VCTAG = "mxvc";
    //hack for custom tag for ie
    var mxview = document.createElement(VCTAG);
    mxview = null;
    var _ = require("underscore");
    var Backbone = require("backbone");
    var El = function(node, id){
        this._node = node || document.createElement(VCTAG);
        this.id = this.idIt(this._node, id);
        this.childNodes = [];
        this.parentNode = null;
        if (node) {
            this.getOnce();
        }
    };
    _.extend(El.prototype, Backbone.Events, {
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
        render: function(viewMod, options){
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
                    self.view = new View(options);
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
        }
    });
    _.extend(El, {
        uniqueId: function(){
            return _.uniqueId("vc-");
        }
    });
    return El;
});
