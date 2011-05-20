define(function(require){
    var _ = require("underscore");
    var Backbone = require("backbone");
    var MxController = function(options){
        this.options = options || {};
        this.view = this.options.view || "app/views/default";
        this.initialize(this.options);
    };
    _.extend(MxController.prototype, {
        initialize: function(){
        }
    });
    MxController.extend = Backbone.Controller.extend;
    return MxController;
});
