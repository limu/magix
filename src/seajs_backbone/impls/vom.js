define("magix/impls/vom", ["magix/base"], function(require) {
	var Base = require("magix/base");
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
});