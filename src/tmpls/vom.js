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
