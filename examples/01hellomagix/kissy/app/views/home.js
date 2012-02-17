/*define(function(require){
	return require("magix/view").extend({});
});
*/
//
KISSY.add("app/views/home",function(S,MxView,Tmpl){
	var HomeView=function(){
		HomeView.superclass.constructor.apply(this,arguments);
	};
	S.extend(HomeView,MxView,{
		render:function(){
			var node=document.getElementById(this.vcid);
			console.log(node);
			node.innerHTML=Tmpl.toHTML(this.template,this.data);
		},
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
	requires:["magix/view","magix/tmpl"]
});