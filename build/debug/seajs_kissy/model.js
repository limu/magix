define("magix/model", ["magix/impls/model", "magix/base"], function(require) {
	var impl = require("magix/impls/model");
	var Base = require("magix/base");
	var Model;
	eval(Base.include("tmpls/model"));
	return Base.implement(Model,impl);
});