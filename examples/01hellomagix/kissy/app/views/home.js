/*define(function(require){
	return require("magix/view").extend({});
});
*/
//
KISSY.add("app/views/home",function(S,MxView,Tmpl){
	return MxView.extend({
		init:function(){
			this.observeHash(["a","b","c"]);
		},
		hashChange:function(){
			console.log('changed');
			console.log(this.hashHasChanged('a'));
			console.log(this.hashHasChangedExcept('b'));
			this.render();
		},
		render:function(){
			var node=document.getElementById(this.vcid);
			console.log(node);
			node.innerHTML=Tmpl.toHTML(this.template,this.data);
			this.hashRealUsing({
				b:3
			});
		},
		events:{
			click:{
				changeHash:function(view){
					S.use('magix/router',function(S,R){
						R.navigateTo({
							a:'1',
							b:'2',
							c:'3'
						});
					})
				}
			}
		},
		renderer:{
			tester:{
				list:function(){
					return "abc";
				}
			}
		}
	});
},{
	requires:["magix/view","magix/tmpl"]
});