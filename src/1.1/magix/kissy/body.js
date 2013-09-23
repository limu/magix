/**
 * @fileOverview body事件代理
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.0
 **/
KISSY.add('magix/body', function(S, Magix, SE) {
    eval(Magix.include('../tmpl/body'));
    Body.lib = function(remove, node, type) {
        var fn = remove ? SE.undelegate : SE.delegate;
        fn.call(SE, node, type, '[mx-' + type + ']', Body.process);
    };
    return Body;
}, {
    requires: ['magix/magix', 'event', 'sizzle']
});