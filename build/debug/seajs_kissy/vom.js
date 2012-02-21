define("magix/vom", ["magix/impls/vom","magix/base","magix/vframe"], function(require) {
	var impl = require("magix/impls/vom");
	var Base = require("magix/base");
	var Vframe = require("magix/vframe");
	var VOM = {};
	eval(Base.include("tmpls/vom"));
	var iVom = Base.implement(VOM, impl);
	return iVom.init();
});