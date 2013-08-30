/**
 * @fileOverview 对magix/view的扩展
 * @version 1.0
 * @author 行列
 */
KISSY.add('mxext/view', function(S, Magix, View, Router) {
    eval(Magix.include('../tmpl/view', 1));
    return MxView;
}, {
    requires: ["magix/magix", "magix/view", "magix/router"]
});