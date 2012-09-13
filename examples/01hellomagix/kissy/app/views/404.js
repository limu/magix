/*define(function(require){
	return require("magix/view").extend({});
});*/
KISSY.add("app/views/404",function(S,MxView){
	return MxView.extend({
		render:function(){
			this.setViewHTML(this.template);
		}
	})
},{
	requires:["magix/view"]
});