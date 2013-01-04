/**
 * @fileOverview Vframe类
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/vframe',function(S,Magix,Event,BaseView){
	eval(Magix.include('../tmpl/vframe'));
	return Vframe;
},{
	requires:["magix/magix","magix/event","magix/view"]
});