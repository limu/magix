/**
 * @fileOverview VOM
 * @author 行列
 * @version 1.0
 */
define("magix/vom",["magix/vframe","magix/magix","magix/event"],function(require){
    var Vframe=require("magix/vframe");
    var Magix=require("magix/magix");
    var Event=require("magix/event");
    eval(Magix.include('../tmpl/vom'));
    return VOM;
});