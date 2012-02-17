define("magix/model", ["magix/impls/model", "magix/base"], function(require) {
	var impl = require("magix/impls/model");
	var Base = require("magix/base");
	var Model;
	/*
 * model
 */
Model=function(){
	
};

Base.mix(Model.prototype,{
	hasChanged:Base.unimpl,//某个属性是否发生了改变
	removeAttr:Base.unimpl,//删除属性
	clear:Base.unimpl,//清除所有的属性
	load:Base.unimpl//获取数据
});
	return Base.implement(Model,impl);
});