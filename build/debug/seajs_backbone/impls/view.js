define("magix/impls/view", ["backbone","magix/vom", "magix/ajax", "magix/template"], function(require, exports, module) {
	var vom = require("magix/vom");
	var ajax = require("magix/ajax");
	var Backbone=require("backbone");
	var template = require("magix/template");
	
	var iView = Backbone.View.extend({
		getVOMObject:function(){
            return vom;
        },
        getAjaxObject:function(){
            return ajax;
        },
        getTemplateObject:function(){
            return template;
        },
        dispose:function(){

        }
	});
	return iView;
});
