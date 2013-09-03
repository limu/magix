/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/vanim', function(S, Router) {
    var Dirs = {
        TOP: 1,
        RIGHT: 2,
        BOTTOM: 4,
        LEFT: 8
    };
    var VAnim = {
        DEFAULT_ANIM_RULE: {
            anim: 'slideLeft',
            root: 'magix_vf_root'
        },
        animCounter: 0,
        getAnimRule: function(e) {
            var me = VAnim;
            var rule = {
                root: 'magix_vf_root'
            };
            var changed = e.changed;
            var loc = e.location;
            var anim = loc.get('anim');
            console.log(changed.isParam('anim'), anim);
            if (changed.isParam('anim') && anim) {
                if (me[anim]) {
                    rule.anim = anim;
                }
            }
            return rule;
        },
        processRoot: function(root) {
            var rootNode = S.one('#' + root);
            if (rootNode.prop('tagName').toUpperCase() == 'BODY') {
                var children = rootNode.children();
                rootNode.append('<div id="' + root + '"></div>').attr('id', '');
                rootNode = S.one('#' + root);
                rootNode.append(children);
            }
        },
        fade: function(root) {
            var me = VAnim;
            me.processRoot(root);
            var rootNode = S.one('#' + root);
            rootNode.before('<div id="' + root + '"></div>');
            rootNode.attr('id', '');
            var newRoot = S.one('#' + root);
            newRoot.css({
                opacity: 0
            }).append(rootNode.clone(true).children());
            me.animCounter++;
            new S.Anim(rootNode, {
                opacity: 0
            }, 1, 'easeNone', function() {
                rootNode.remove();
                new S.Anim(newRoot, {
                    opacity: 1
                }, 1, 'easeNone', function() {
                    me.animCounter--;
                }).run();
            }).run();
        },
        slide: function(root, dir) {
            var me = VAnim;
            me.processRoot(root);
            var rootNode = S.one('#' + root);
            var parent = rootNode.parent();
            if (!me.animCounter) {
                me.$bakPosition = parent.css('position');
                me.$bakOverflow = parent.css('overflow');
            }
            parent.css({
                position: 'relative',
                overflow: 'hidden'
            });
            rootNode.before('<div id="' + root + '"></div>');
            rootNode.attr('id', '');
            var newRoot = S.one('#' + root);

            var newRootIniAnimAttrs = {};
            var oldRootIniAnimAttrs = {
                position: 'absolute',
                width: rootNode.outerWidth(),
                height: rootNode.outerHeight(),
                left: 0,
                top: 0
            };
            if (dir == Dirs.LEFT) {
                newRootIniAnimAttrs = {
                    position: 'absolute',
                    left: rootNode.outerWidth(),
                    top: 0
                };
            } else if (dir == Dirs.TOP) {
                newRootIniAnimAttrs = {
                    position: 'absolute',
                    left: 0,
                    top: rootNode.outerHeight()
                };
            } else if (dir == Dirs.RIGHT) {
                newRootIniAnimAttrs = {
                    position: 'absolute',
                    left: -rootNode.outerWidth(),
                    top: 0
                };
            } else if (dir == Dirs.BOTTOM) {
                newRootIniAnimAttrs = {
                    position: 'absolute',
                    left: 0,
                    top: -rootNode.outerHeight()
                };
            }
            newRootIniAnimAttrs.width = oldRootIniAnimAttrs.width;
            newRootIniAnimAttrs.height = oldRootIniAnimAttrs.height;


            newRoot.css(newRootIniAnimAttrs).append(rootNode.clone(true).children());

            rootNode.css(oldRootIniAnimAttrs);


            var oldRootAnimAttrs = {};
            var newRootAnimAttrs = {};

            if (dir == Dirs.LEFT) {
                oldRootAnimAttrs.left = -rootNode.outerWidth();
                newRootAnimAttrs.left = 0;
            } else if (dir == Dirs.TOP) {
                oldRootAnimAttrs.top = -rootNode.outerHeight();
                newRootAnimAttrs.top = 0;
            } else if (dir == Dirs.RIGHT) {
                oldRootAnimAttrs.left = rootNode.outerWidth();
                newRootAnimAttrs.left = 0;
            } else if (dir == Dirs.BOTTOM) {
                oldRootAnimAttrs.top = rootNode.outerHeight();
                newRootAnimAttrs.top = 0;
            }
            me.animCounter++;
            new S.Anim(rootNode, oldRootAnimAttrs, 0.8, 'easeOut').run();
            new S.Anim(newRoot, newRootAnimAttrs, 0.8, 'easeOut', function() {
                rootNode.remove();
                newRoot.css({
                    position: 'static',
                    width: 'auto',
                    height: 'auto'
                });
                me.animCounter--;
                if (!me.animCounter) {
                    parent.css({
                        position: me.$bakPosition,
                        overflow: me.$bakOverflow
                    });
                }
            }).run();
        },
        slideLeft: function(root) {
            VAnim.slide(root, Dirs.LEFT);
        },
        slideTop: function(root) {
            VAnim.slide(root, Dirs.TOP);
        },
        slideRight: function(root) {
            VAnim.slide(root, Dirs.RIGHT);
        },
        slideBottom: function(root) {
            VAnim.slide(root, Dirs.BOTTOM);
        },
        locationChange: function(e) {
            if (!e.force) {
                var me = VAnim;
                var rule = me.getAnimRule(e);
                if (rule) {
                    var fn = me[rule.anim];
                    if (fn) {
                        fn(rule.root);
                    }
                }
            }
        }
    };
    Router.on('changed', VAnim.locationChange);
}, {
    requires: ['magix/router', 'node', 'anim']
});