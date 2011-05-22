define(function(require){
    var _ = require("underscore");
    var MxVCElement = require("./mxvc_element");
    var vom = _.extend({
        _idMap: {},
        root: null,
        init: function(){
            var vc = vom.createElement(null, "vc-root");
            document.body.insertBefore(vc.getOnce(), document.body.firstChild);
            vom.root = vc;
            return vom;
        },
        push: function(vc){
            vom._idMap[vc.id] = vc;
        },
        createElement: function(ele, id){
            if (_.isString(ele)) {
                ele = document.getElementById(ele);
            }
            var vc = new MxVCElement(ele, id);
            vom.push(vc);
            return vc;
        },
        getElementById: function(id){
            return this._idMap[id] || null;
        }
    });
    window.MXVom = vom;//TODO del
    return vom.init();
});
