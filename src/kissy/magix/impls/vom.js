//implement vom
KISSY.add("magix/impls/vom",function(S,Base){
	var iVOM = {
		setRootVframe : function() {
			var rootNode = null;
			if(document.body.id == "vf-root") {
				rootNode = document.body;
			}
			var rootVframe = this.createElement(rootNode, "vf-root");
			if(!rootNode) {
				document.body.insertBefore(rootVframe.getOnce(), document.body.firstChild);
			}
			this.root = rootVframe;
		}
	};
	return iVOM;
},{
	requires:["magix/base"]
});