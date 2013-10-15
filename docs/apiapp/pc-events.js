/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('apiapp/pc-events', function(S, Body, Magix, SE, View) {
    Body.lib = function(remove, node, type) {
        var fn = remove ? SE.undelegate : SE.delegate;
        fn.call(SE, node, type, '[mx-' + type + ']', Body.process);
    };
    Body.special(Magix.listToMap('submit,focusin,focusout,mouseenter,mouseleave,mousewheel,change'));
}, {
    requires: ['magix/body', 'magix/magix', 'event', 'magix/view', 'sizzle']
});