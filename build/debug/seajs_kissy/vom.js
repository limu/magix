define("magix/vom", ["magix/impls/vom","magix/base","magix/vframe"], function(require) {
	var impl = require("magix/impls/vom");
	var Base = require("magix/base");
	var Vframe = require("magix/vframe");
	var VOM = {};
	Base.mix(VOM, {
	_idMap : {},
	root : null,
	setRootVframe : Base.unimpl,
	init : function() {
		this.setRootVframe();
		return this;
	},
	push : function(vc) {
		this._idMap[vc.id] = vc;
	},
	pop : function(vc) {
		delete this._idMap[vc.id];
	},
	createElement : function(ele, id) {
		if(Base.isString(ele)) {
			ele = document.getElementById(ele);
		}
		var vc = new Vframe(ele, id);
		this.push(vc);
		return vc;
	},
	getElementById : function(id) {
		return this._idMap[id] || null;
	}
});

	var iVom = Base.implement(VOM, impl);
	return iVom.init();
});