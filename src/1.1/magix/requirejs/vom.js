/**
 * @fileOverview VOM
 * @author 行列
 * @version 1.0
 */
define("magix/vom", ["magix/vframe", "magix/magix", "magix/event"], function(Vframe, Magix, Event) {
    eval(Magix.include('../tmpl/vom'));
    return VOM;
});