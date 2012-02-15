define("magix/impls/model", ["backbone"], function(require) {
	var Backbone = require("backbone");
	var iModel = Backbone.Model;
	iModel.prototype.removeAttr=function(name){
		this.unset(name,{slient:true});
	};
	iModel.prototype.load=function(){
		this.fetch.apply(this,arguments);
	};
	return iModel;
});