define("magix/vframe", ["magix/impls/vframe", "magix/base"], function(require) {
	var Base = require("magix/base");
	var impl = require("magix/impls/vframe");
	var Vframe;
	eval(Base.include("tmpls/vframe"));
	var iVframe = Base.implement(Vframe,impl);
	return iVframe.init();
});