//implement vframe
KISSY.add("magix/impls/vframe",function(S,Base){
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
			var router;
			KISSY.use("magix/router",function(S,R){
				router=R;
			});
			return router;
		},
		getVOMObject:function(){
			var vom;
			S.use("magix/vom",function(S,VOM){
				vom=VOM;
			});
			return vom;
		},
		createFrame:function(){
			return document.createElement(iVframe.tagName);
		}
	});
	return iVframe;
},{
	requires:["magix/base"]
});
