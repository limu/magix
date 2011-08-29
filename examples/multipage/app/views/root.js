define(function(require){
	return require("magix/view").extend({
		render:function(){
			return true;
		},
		getTemplate : function(cb, name) {
			cb();
		}
	});
});
