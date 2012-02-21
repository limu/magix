define("magix/view", ["magix/impls/view","magix/base"], function(require, exports, module) {
	var impl = require("magix/impls/view");
	var Base=require("magix/base");
	var View;
	eval(Base.include("tmpls/view"));
	return Base.implement(View,impl);
});