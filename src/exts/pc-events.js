/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/pc-events', function(S, Body, Magix) {
    Body.special(Magix.listToMap('submit,focusin,focusout,mouseenter,mouseleave,mousewheel,change'));
}, {
    requires: ['magix/body', 'magix/magix']
});