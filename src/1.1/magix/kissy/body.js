/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add('magix/body', function(S, Magix) {
    eval(Magix.include('../tmpl/body'));
    return Body;
}, {
    requires: ['magix/magix']
});