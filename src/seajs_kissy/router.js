define("magix/router",["magix/impls/router","magix/base"],function(require){
	var impl = require("magix/impls/router");
	var Base = require("magix/base");
	var Router = {};
	eval(Base.include("tmpls/router"));
	return Base.implement(Router, impl);
});