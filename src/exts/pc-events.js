/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/pc-events', function(S, Body, Magix, SE) {
    Body.lib = function(remove, node, type) {
        var fn = remove ? SE.undelegate : SE.delegate;
        fn.call(SE, node, type, '[mx-' + type + ']', Body.process);
    };
    Body.special(Magix.listToMap('submit,focusin,focusout,mouseenter,mouseleave,mousewheel,change'));
}, {
    requires: ['magix/body', 'magix/magix', 'event', 'sizzle']
});