/**
 * @fileOverview view类
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/view',function(S,IView,Magix,Event){
	eval(Magix.include('../tmpl/view'));
	Magix.mix(View,IView,{prototype:true});
	Magix.mix(View.prototype,IView.prototype);
	return View;
},{
	requires:["magix/impl/view","magix/magix","magix/event"]
});