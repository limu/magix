/**
 * VOM(View Object Model)  管理vcelement
 * @module vom
 * @requires underscore,backbone,libs/magix/vcelement
 */
/**
 * @class Vom
 * @namespace libs.magix
 * @static
 */
define(function(require){
    var _ = require("underscore");
    var MxVCElement = require("./vcelement");
    var Backbone = require("backbone");
    var vom = _.extend(Backbone.Events, {
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
		pop:function(vc){
			delete vom._idMap[vc.id];
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
