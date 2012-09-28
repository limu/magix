Base.mix(VOM, {
	_idMap : {},
	root : null,
	setRootVframe : Base.unimpl,
	getVframeClass:Base.unimpl,
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
		var Vframe=this.getVframeClass(),
			vc=new Vframe(ele,id);
		vc.__VOM=this;
		vc.__Router=this.__Router;
		this.push(vc);
		return vc;
	},
	getElementById : function (id) {
		return this._idMap[id] || null;
	},
	get:function(id){
		return this.getElementById(id);
	},
	broadcaseMessage:function(data,from){
		var me=this,c=me._idMap;
		for(var p in c){
			c[p].postMessage(data,from||this);
		}
	},
	notifyQueryModelChange:function(qm){
		var me=this;
		if(me.root&&me.root.view){
			me.root.view._queryModelChange(qm);
		}
		for(var p in me._idMap){
			try{
				var view=me._idMap[p].view;
				if(view&&view.exist){
					view._hashChange(qm);
				}
			}catch(e){
				console.log(e);
			}
		}
	},
	mountRootView:function(viewName,queryModel){
		var me=this;
		if(me.root){
			me.root.mountView(viewName,{
				queryModel:queryModel
			});
		}
	}
});
