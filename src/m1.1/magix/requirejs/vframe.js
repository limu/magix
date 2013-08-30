/**
 * @fileOverview Vframe类
 * @author 行列
 * @version 1.0
 */
define('magix/vframe', ["magix/magix", "magix/event", "magix/view"], function(Magix, Event, BaseView) {
    eval(Magix.include('../tmpl/vframe'));
    return Vframe;
});