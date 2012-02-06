/*define(function(require){
	return require("magix/view").extend({});
});
*/
//
KISSY.add("app/views/home",function(S,MxView){
	var HomeView=function(){
		HomeView.superclass.constructor.apply(this,arguments);
	};
	S.extend(HomeView,MxView);
	return HomeView;
},{
	requires:["magix/view"]
});