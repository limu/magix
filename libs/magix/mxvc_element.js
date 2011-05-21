define(function(require,exports,module){
    //hack for custom tag for ie
    var mxview = document.createElement("mxvc");
    mxview = null;
    //
    var _ = require("underscore");
    var El = function(node){
        this.id = El.uniqueId();
        this._node = node || document.createElement("mxvc");
        this._node.id = this.id;
    };
    _.extend(El.prototype, {
        view: null,
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
            var self = this;
            if (viewMod == oldViewMod) {
                this.view.set(options);
            }
            else {
                if (this.view) {
                    this.view.destory();
                    this.view = null;
                }
                module.load(viewMod, function(View){
                    self.view = new View(_.extend(options, {
                        vcid: self.id
                    }));
                    self.view.render();
                });
            }
        },
        getAttribute: function(s){
            var node = document.getElementById(this.id);
            return node.getAttribute(s) || "";
        }
    });
    _.extend(El, {
        uniqueId: function(){
            return _.uniqueId("vc-");
        }
    });
    return El;
});
