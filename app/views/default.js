define(function(require){
	var Backbone = require("backbone"); 
	var View = Backbone.View.extend({
		initialize:function(o){
			this.vcid = o.vcid;
			this.query = o.query;
		},
		render:function(){
			var node = document.getElementById(this.vcid);
			node.innerHTML = this.query.path;
		},
		destory:function(){
			var node = document.getElementById(this.vcid);
			node.innerHTML = "";
		}
	});
	return View;
});
