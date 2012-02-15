/*define(function(require){
	return require("magix/view").extend({});
});
*/
//
KISSY.add("app/views/home",function(S,MxView){
	var HomeView=function(){
		HomeView.superclass.constructor.apply(this,arguments);
	};
	S.extend(HomeView,MxView,{
		renderer:{
			tester:{
				list:function(){
					return "abc";
				}
			}
		}
	});
	return HomeView;
},{
	requires:["magix/view"]
});