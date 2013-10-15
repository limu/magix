/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/m-events', function(S, Body, Magix, SE) {
    Body.lib = function(remove, node, type) {
        var fn = remove ? SE.undelegate : SE.delegate;
        fn.call(SE, node, type, '[mx-' + type + ']', Body.process);
    };
    Body.special(Magix.listToMap('focusin,tap,double-tap,pinch,swipe')); //其它的自已加
}, {
    requires: ['magix/body', 'magix/magix', 'event', 'sizzle']
});