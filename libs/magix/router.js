define(function(require, exports, module){
    var Backbone = require("backbone");
    var MxRouter = Backbone.Controller.extend({
        initialize: function(o){
            this.config = o.config;
            this.resource = o.resource;
        },
        routes: {
            "!*query": "_route",
            "*query": "_route"
        },
        _route: function(hash){
            var i, tmpArr, paraArr, kv, k, v;
            
            this.previousQuery = this.query || null;
            
            this.query = {
                path: this.config.indexPath,
                para: {}
            };
            if (hash) {
                tmpArr = hash.split("/");
                paraArr = tmpArr.pop().split("&");
                this.query.path = tmpArr.join("/");
                for (i = 0; i < paraArr.length; i++) {
                    kv = paraArr[i].split("=");
                    this.query.para[kv[0]] = kv[1] || "";
                }
            }
            this._goto();
        },
        _goto: function(){
            var self = this;
            var ctrl;
            module.load("app/controllers" + self.query.path, function(Ctrl){
                if (Ctrl) {
                    ctrl = new Ctrl({
                        router: self
                    });
                }
                else {
                    module.load("app/controllers" + self.config.notFoundPath, function(Ctrl){
                        if (Ctrl) {
                            ctrl = new Ctrl({
                                router: self
                            });
                        }
                    });
                }
            });
        }
    });
    module.exports = MxRouter;
});
