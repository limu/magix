//vframe
KISSY.add("magix/vframe",function(S,impl,Base){
	var Vframe;
	eval(Base.include("../tmpls/vframe"));
	var iVframe = Base.implement(Vframe,impl);
	return iVframe.init();
},{
	requires:["magix/impls/vframe","magix/base"]
});