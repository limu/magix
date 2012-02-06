define(function(require){
	var View=require("magix/view");
    var S=KISSY;
    var NotFoundView=function(){
        NotFoundView.superclass.constructor.apply(this,arguments);
    };
    S.extend(NotFoundView,View,{
		events:{
			click:{
				test:function(){
					console.log(arguments);
				}
			}
		}
	});
    return NotFoundView;
});
