/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
define("magix/body",["magix/magix"],function(require){
    //todo dom event and sizzle
    var Magix=require("magix/magix");
    eval(Magix.include('../tmpl/body'));
    Body.unbubble=function(remove,node,type){
    	var fn=remove?'undelegate':'delegate';
        $(node)[fn]('[mx-'+type+']',type,Body.process);
    };
    return Body;
});