define(function(require){
    var MxController = require("libs/magix/controller");
    var Ctrl = MxController.extend({
        initialize: function(options){
            console.log("to show " + this.view);
        }
    });
    return Ctrl;
});
