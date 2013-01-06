/**
 * @fileOverview 路由
 * @author 行列
 * @version 1.0
 */
KISSY.add('magix/router',function(S,IRouter,Magix,Event){
    eval(Magix.include('../tmpl/router'));
    return Magix.mix(Router,IRouter);
},{
    requires:["magix/impl/router","magix/magix","magix/event"]
});