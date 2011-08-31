define("magix/emptyview", ["magix/view"],function(require, exports, module) {
	var MxView = require("magix/view").extend({
		preventRender:true
	});
	return MxView;
});
