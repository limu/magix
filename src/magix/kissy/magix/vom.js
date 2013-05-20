/**
 * @fileOverview VOM
 * @author 行列
 * @version 1.0
 */
KISSY.add("magix/vom",function(S,Vframe,Magix,Event,Body){
    eval(Magix.include('../tmpl/vom'));
    Body.VOM=VOM;
    Body.on('event',function(e){
        var vframe=VOM.get(e.hld);
        var view=vframe&&vframe.view;
        if(view){
            view.processEvent(e);
        }
    });
    return VOM;
},{
    requires:["magix/vframe","magix/magix","magix/event","magix/body"]
});