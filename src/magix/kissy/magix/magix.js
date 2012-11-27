/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add('magix/magix',function(S,IMagix){
	eval(IMagix.include('../tmpl/magix'));
	return Magix.mix(Magix,IMagix);
},{
	requires:["magix/impl/magix"]
});