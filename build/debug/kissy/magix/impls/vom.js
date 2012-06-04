//implement vom
KISSY.add("magix/impls/vom",function(S,Base,Vframe){
	var iVOM = {
		setRootVframe : function() {
			var rootNode = document.getElementById('vf-root'),
				rootVframe = this.createElement(rootNode, "vf-root");
			if(!rootNode) {
				document.body.insertBefore(rootVframe.getOnce(), document.body.firstChild);
			}
			this.root = rootVframe;
		},
		getVframeClass:function(){
			return Vframe;
		}
	};
	return iVOM;
},{
	requires:["magix/base","magix/vframe"]
});