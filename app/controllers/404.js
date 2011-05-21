define(function(require){
    var MxController = require("libs/magix/controller");
    var vom = require("libs/magix/vom");
    var Ctrl = MxController.extend({
        initialize: function(){
            vom.root.render(this.viewMod, {
                query: this.query
            });
        }
    });
    return Ctrl;
});
