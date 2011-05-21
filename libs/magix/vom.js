define(function(require){
    var _ = require("underscore");
    var mxview = document.createElement("mxview");
    var vom = _.extend({
        init: function(){
            var vs = document.getElementsByTagName("mxview"), v;
            if (vs.length > 0) {
                this.root = vs[0];
            }
            else {
                document.body.insertBefore(mxview, document.body.firstChild);
                this.root = mxview;
            }
            return this;
        }
    });
    return vom.init();
});
