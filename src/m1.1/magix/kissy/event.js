/**
 * @fileOverview 多播事件对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add("magix/event",function(S,Magix){
    eval(Magix.include('../tmpl/event'));
    return Event;
},{
    requires:["magix/magix"]
});