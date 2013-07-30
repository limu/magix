/**
 * @fileOverview 对magix/view的扩展
 * @version 1.0
 * @author 行列
 */
define('mxext/view', ["magix/magix", "magix/view", "magix/router"], function(require) {
    var Magix = require("magix/magix");
    var View = require("magix/view");
    var Router = require("magix/router");

    eval(Magix.include('../tmpl/view', 1));
    return MxView;
});