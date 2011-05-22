define(function(require){
    var MxController = require("libs/magix/controller");
    var vom = require("libs/magix/vom");
    var Ctrl = MxController.extend({
        viewMod: "app/views/default",
        initialize: function(){
            vom.root.render(this.viewMod, {
                queryModel: this.queryModel
            });
        }
    });
    return Ctrl;
});
