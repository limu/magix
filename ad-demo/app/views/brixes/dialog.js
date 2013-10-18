/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('app/views/brixes/dialog', function(S, View, Dialog) {
    return View.extend({
        render: function() {
            var me = this;
            me.renderByPagelet({}, function(pagelet) {
                var config = {
                    tmpl: pagelet.getStoreTmpl('dialogcontent'),
                    start: {
                        left: 1000,
                        top: 100,
                        opacity: 0
                    },
                    end: {
                        left: 100,
                        top: 100,
                        opacity: 1
                    },
                    width: 300
                };
                me.manage('dialog', new Dialog(config));

                var config1 = {
                    tmpl: pagelet.getStoreTmpl('dialogcontent'),
                    align: {
                        node: false,
                        points: ['cc', 'cc'],
                        offset: [0, 0]
                    },
                    elStyle: {
                        position: S.UA.ie == 6 ? 'absolute' : 'fixed'
                    },
                    width: 300,
                    mask: true
                };

                me.manage('dialog1', new Dialog(config1));
            });
        },
        'hide<click>': function(e) {
            var me = this;
            var dlg = me.getManaged('dialog');
            if (dlg) {
                dlg.hide();
            }
        },
        'showLeft<click>': function(e) {
            var me = this;
            var dlg = me.getManaged('dialog');
            if (dlg) {
                dlg.hide();
                dlg.set('start', {
                    left: -300,
                    top: 100,
                    opacity: 0
                });

                dlg.set('end', {
                    left: 0,
                    top: 100,
                    opacity: 1
                });
                dlg.show();
            }
        },
        'showRight<click>': function(e) {
            var me = this;
            var dlg = me.getManaged('dialog');
            if (dlg) {
                dlg.hide();
                dlg.set('start', {
                    left: S.DOM.docWidth(),
                    top: 100,
                    opacity: 0
                });

                dlg.set('end', {
                    left: S.DOM.docWidth() - 300,
                    top: 100,
                    opacity: 1
                });
                dlg.show();
            }
        },
        'showBottom<click>': function(e) {
            var me = this;
            var dlg = me.getManaged('dialog');
            if (dlg) {
                dlg.hide();
                dlg.set('start', {
                    left: 300,
                    top: S.DOM.docHeight(),
                    opacity: 0
                });

                dlg.set('end', {
                    left: 300,
                    top: S.DOM.docHeight() - 167,
                    opacity: 1
                });
                dlg.show();
            }
        },
        'showTop<click>': function(e) {
            var me = this;
            var dlg = me.getManaged('dialog');
            if (dlg) {
                dlg.hide();
                dlg.set('start', {
                    left: 600,
                    top: -167,
                    opacity: 0
                });

                dlg.set('end', {
                    left: 600,
                    top: 0,
                    opacity: 1
                });
                dlg.show();
            }
        },
        'showModal<click>': function(e) {
            var me = this;
            var dlg = me.getManaged('dialog');
            if (dlg) dlg.hide();
            dlg = me.getManaged('dialog1');
            if (dlg) {
                dlg.show();
                dlg.center();
            }
        },
        'done<click>': function(e) {
            window.alert('done');
        }
    });
}, {
    requires: ['mxext/view', 'brix/gallery/dialog/index', 'brix/gallery/dialog/index.css']
});