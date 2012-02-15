//implement vframe
KISSY.add("magix/impls/vframe",function(S,Base,Router){
	var vframeTagName = "vframe";
	var iVframe=function(){
		
	};
	Base.mix(iVframe,{
		tagName:vframeTagName
	});
	Base.mix(iVframe.prototype,{
		getChildVframeNodes : function() {
			var node = document.getElementById(this.id);
			var nodes = node.getElementsByTagName(vframeTagName);
			var i, res = [];
			for( i = 0; i < nodes.length; i++) {
				res.push(this._idIt(nodes[i]));
			}
			return res;
		},
		getRouterObject:function(){
			return Router;
		},
		createFrame:function(){
			return document.createElement(iVframe.tagName);
		}
	});
	return iVframe;
},{
	requires:["magix/base","magix/router"]
});
