define(function(require){
    //hack for custom tag for ie
    var mxview = document.createElement("mxview");
    mxview = null;
    //
    var _ = require("underscore");
    var El = function(node){
        this.id = El.uniqueId();
        this._node = node || document.createElement("mxview");
        this._node.id = this.id;
    };
    _.extend(El.prototype, {
        getOnce: function(){
            var node = this._node;
            if (!node) {
                console.warn("always get once");
            }
            this._node = null;
            return node;
        }
    });
    _.extend(El, {
        uniqueId: function(){
            return _.uniqueId("mxv-");
        }
    });
    return El;
});
