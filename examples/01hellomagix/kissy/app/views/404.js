/*define(function(require){
	return require("magix/view").extend({});
});*/
KISSY.add("app/views/404",function(S,MxView){
	var NotFoundView=function(){
		NotFoundView.superclass.constructor.apply(this,arguments);
	};
	S.extend(NotFoundView,MxView);
	return NotFoundView;
},{
	requires:["magix/view"]
});