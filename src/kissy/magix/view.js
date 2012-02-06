//view
KISSY.add("magix/view",function(S,impl,Base){
	var View;
	eval(Base.include("../tmpls/view"));
	return Base.implement(View,impl);
},{
	requires:["magix/impls/view","magix/base"]
});