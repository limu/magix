define(function(require,exports,module){
	var MxView = require("libs/magix/view");
	var View = MxView.extend({
		init:function(){
			this.modUri = module.uri;
		}
	});
	return View;
});
