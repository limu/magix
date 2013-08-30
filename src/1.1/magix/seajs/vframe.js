/**
 * @fileOverview Vframe类
 * @author 行列
 * @version 1.0
 */
define('magix/vframe',["magix/magix","magix/event","magix/view"],function(require){
    var Magix=require("magix/magix");
    var Event=require("magix/event");
    var BaseView=require("magix/view");
    eval(Magix.include('../tmpl/vframe'));
    return Vframe;
});