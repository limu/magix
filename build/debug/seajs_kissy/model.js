define("magix/model", ["magix/impls/model", "magix/base"], function(require) {
	var impl = require("magix/impls/model");
	var Base = require("magix/base");
	var Model;
	/*
 * 
 */
Model=function(){
	
};
	return Base.implement(Model,impl);
});