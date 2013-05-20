KISSY.add("~seed/app/views/404",function(S,View){
	return View.extend({
		render:function(){
			this.setViewHTML(this.template);
		},
		events:{
			click:{
				goBack:function(e){
					history.back();
				}
			}
		}
	})
},{
	requires:["magix/view"]
});