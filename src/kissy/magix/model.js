//
KISSY.add("magix/model",function(S,impl,Base){
	var Model;
	eval(Base.include("../tmpls/model"));
	return Base.implement(Model,impl);
},{
	requires:["magix/impls/model","magix/base"]
});