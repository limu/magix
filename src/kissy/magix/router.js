// magix router
KISSY.add("magix/router",function(S,impl,Base){
	var Router = {};
	eval(Base.include("../tmpls/router"));
	Base.mix(Router, impl);
	return Router;
},{
	requires:["magix/impls/router","magix/base"]
});