define(function(require){
    var _ = require("underscore");
    var MxVCElement = require("./mxvc_element");
    var vom = _.extend({
        _idMap: {},
        root: null,
        init: function(){
            var vc = vom.createElement();
            document.body.insertBefore(vc.getOnce(), document.body.firstChild);
            vom.root = vc;
            return vom;
        },
        push: function(vc){
            vom._idMap[vc.id] = vc.id;
        },
        createElement: function(ele){
            var vc = new MxVCElement(ele);
            vom.push(vc);
            return vc;
        }
    });
    window.vom = vom;//todo del
    return vom.init();
});
