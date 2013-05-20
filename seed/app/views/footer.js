KISSY.add("~seed/app/views/footer",function(S,View){
	return View.extend({
		render:function(){
			this.setViewPagelet();
		}
	})
},{
	requires:["mxext/view","brix/gallery/footer/index.css"]
});