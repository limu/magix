/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/m-events', function(S, Body, Magix) {
    Body.special(Magix.listToMap('tap,double-tap,pinch,swipe')); //其它的自已加
}, {
    requires: ['magix/body', 'magix/magix']
});