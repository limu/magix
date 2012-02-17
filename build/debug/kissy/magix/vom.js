//vom
KISSY.add("magix/vom",function(S,impl,Base,Vframe){
	var VOM = {};
	Base.mix(VOM, {
	_idMap : {},
	root : null,
	setRootVframe : Base.unimpl,
	init : function () {
		var me = this;
		if (!me.inited) { //确保只执行一次
			me.setRootVframe();
			me.inited = true;
		}
		return me;
	},
	push : function (vc) {
		this._idMap[vc.id] = vc;
	},
	pop : function (vc) {
		delete this._idMap[vc.id];
	},
	createElement : function (ele, id) {
		if (Base.isString(ele)) {
			ele = document.getElementById(ele);
		}
		var vc = new Vframe(ele, id);
		this.push(vc);
		return vc;
	},
	getElementById : function (id) {
		return this._idMap[id] || null;
	}
});

	Base.mix(VOM, impl);
	return VOM.init();
},{
	requires:["magix/impls/vom","magix/base","magix/vframe"]
});
