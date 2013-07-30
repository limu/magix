/**
 * @fileOverview 多播事件对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
define("magix/event",["magix/magix"],function(require){
    var Magix=require("magix/magix");
    eval(Magix.include('../tmpl/event'));
    return Event;
});