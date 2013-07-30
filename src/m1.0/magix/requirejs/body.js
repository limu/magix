/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
define("magix/body", ["magix/magix"], function(Magix) {
    //todo dom event and sizzle
    eval(Magix.include('../tmpl/body'));
    Body.unbubble = function(remove, node, type) {
        var fn = remove ? 'undelegate' : 'delegate';
        $(node)[fn]('[mx-' + type + ']', type, Body.process);
    };
    return Body;
});