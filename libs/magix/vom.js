define(function(require){
    var _ = require("underscore");
    var MxViewElement = require("./viewelement");
    var vom = _.extend({
        _idMap: {},
        init: function(){
            var ve = vom.createElement();
            document.body.insertBefore(ve.getOnce(), document.body.firstChild);
            vom.body = ve;
            return vom;
        },
        push: function(ve){
            vom._idMap[ve.id] = ve.id;
        },
        createElement: function(ele){
            var ve = new MxViewElement(ele);
            vom.push(ve);
            return ve;
        }
        //,
        //        getElements: function(){
        //            //return document.getElementsByTagName("mxview");
        //        }
    });
    window.vom = vom;//todo del
    return vom.init();
});
