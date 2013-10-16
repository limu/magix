KISSY.add("app/account/views/remind", function (S, Node, View, Tmpl, Mu, Pagelet, MM, JSON,Router) {
    var $ = Node.all;
    return View.extend({
        defalutData: function () {
            this.defaultRemind();
            this.defaultLimit();
        },
        defaultRemind: function () {
            this.vm.set("remindBalance", 30);
            this.vm.set("remindWangCheck", '');
            this.vm.set("remindTelCheck", '');
            this.vm.set("remindTelNum", '');
        },
        defaultLimit: function () {
            this.vm.set("limitTime", 16);
            this.vm.set("limitBalance", 10);
            this.vm.set("limitWangCheck", '');
            this.vm.set("limitTelCheck", '');
            this.vm.set("limitTelNum", '');
        },
        init: function () {
            //this.vm.registerDataKey(['remindBalance', 'remindWangCheck', 'remindTelCheck', 'remindTelNum', 'Random','limitTime', 'limitBalance', 'limitWangCheck', 'limitTelCheck', 'limitTelNum', 'droplist', 'customerId']);
            this.defalutData();
            this.vm.set("droplist", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);

        },
        render: function () {
            var me = this,
                form = null,
                location = me.location;

            var request = MM.fetchAll([{
                name: 'Remind_Get'
            }], function (remindGetModel) {
                var list = remindGetModel.get('list'),
                    currentRemind;
                var hasRemindData = false;
                var hasLimitData = false;
                if (list && list.length > 0) {
                    for (var i = 0; i < list.length; i++) {
                        currentRemind = list[i];
                        if ((currentRemind.remindType == '1') && (hasRemindData == false)) {
                            hasRemindData = true;
                            me.vm.set('remindBalance', currentRemind.alertMinBalance || 30);
                            me.vm.set('customerId', currentRemind.customerId);
                            switch (currentRemind.remindState) {
                                case '1':
                                    me.vm.set("remindWangCheck", 'checked');
                                    me.vm.set("remindTelCheck", '');
                                    break;
                                case '2':
                                    me.vm.set("remindWangCheck", '');
                                    me.vm.set("remindTelCheck", 'checked');
                                    me.vm.set("remindTelNum", currentRemind.mobileNo);
                                    break;
                                case '3':
                                    me.vm.set("remindWangCheck", 'checked');
                                    me.vm.set("remindTelCheck", 'checked');
                                    me.vm.set("remindTelNum", currentRemind.mobileNo);
                                    break;
                            }
                        } else if ((currentRemind.remindType == '2') && (hasLimitData == false)) {
                            hasLimitData = true;
                            me.vm.set('limitBalance', currentRemind.alertMinBalance || 30);
                            me.vm.set('limitTime', currentRemind.dayLimitTime || 16);
                            switch (currentRemind.remindState) {
                                case '1':
                                    me.vm.set("limitWangCheck", 'checked');
                                    me.vm.set("limitTelCheck", '');
                                    break;
                                case '2':
                                    me.vm.set("limitWangCheck", '');
                                    me.vm.set("limitTelCheck", 'checked');
                                    me.vm.set("limitTelNum", currentRemind.mobileNo);
                                    break;
                                case '3':
                                    me.vm.set("limitWangCheck", 'checked');
                                    me.vm.set("limitTelCheck", 'checked');
                                    me.vm.set("limitTelNum", currentRemind.mobileNo);
                                    break;
                            }
                        }
                    }

                    if (hasRemindData == false) {
                        me.defaultRemind();
                    }
                    if (hasLimitData == false) {
                        me.defaultLimit();
                    }

                } else {
                    me.defalutData();
                }
                var random = S.guid();
                me.vm.set('Random', random);
                me.setViewPagelet(me.vm.toJSON(), function (pagelet) {
                    var tip = pagelet.getBrick('J_global_tip');
                    form = pagelet.getBrick('J_remind_form');
                    form.detach('beforeSubmit');
                    form.on('beforeSubmit', function () {
                        var remindBalance = $('#J_remind_form_blance').val();
                        var remindWangCheck = $('#J_balance_wangwang').prop('checked');
                        var remindTelCheck = $('#J_balance_tel').prop('checked');
                        var remindTel = $('#J_balance_tel_val').val();
                        var limitTime = $('#limit_time').html();
                        var limitBalance = $('#J_limit_blance').val();
                        var limitWangCheck = $('#J_limit_wangwang').prop('checked');
                        var limitTelCheck = $('#J_limit_tel').prop('checked');
                        var limitTel = $('#J_limit_tel_val').val();

                        var remindObj = {
                            customerId: me.vm.get('customerId'),
                            alertMinBalance: remindBalance,
                            remindState: (function (a, b) {
                                if (a && !b) return '1';
                                if (!a && b) return '2';
                                if (a && b) return '3';
                                return '0';
                            })(remindWangCheck, remindTelCheck),
                            remindType: "1",
                            mobileNo: remindTel
                        };

                        var limitObj = {
                            customerId: me.vm.get('customerId'),
                            alertMinBalance: limitBalance,
                            remindState: (function (a, b) {
                                if (a && !b) return '1';
                                if (!a && b) return '2';
                                if (a && b) return '3';
                                return '0';
                            })(limitWangCheck, limitTelCheck),
                            dayLimitTime: limitTime,
                            remindType: "2",
                            mobileNo: limitTel
                        };

                        if (remindTelCheck && limitTelCheck && remindObj.mobileNo.length > 0 && limitObj.mobileNo.length > 0 && remindObj.mobileNo != limitObj.mobileNo) {
                            if (tip) {
                                tip.set({
                                    type: 'stop',
                                    content: '账户余额提醒与日限额提醒手机号必须一致'
                                })
                                tip.show();
                            }
                            return;
                        }

                        me.manage('tip', tip);

                        var request = MM.saveAll({
                            name: 'Remind_Update',
                            urlParams: { remindSettings: JSON.stringify([remindObj, limitObj]) }
                        },

                        function (model) {
                            if (tip) {
                                tip.set({
                                    type: 'ok',
                                    content: '更新成功'
                                })
                                tip.show();
                            }
                            me.render();
                        }, function (msg) {
                            alert(msg);
                        });
                        me.manage(request);
                    });
                    me.manage('form', form);
                });

                form = me.getManaged('form');
                if (form) {
                    form.reset(true);
                }

            }, function (msg) {
                me.setViewHTML(msg);
            });
            me.manage(request);            
        },
        events: {
            change: {
                checkMobile: function (e) {
                    var target = $('#' + e.targetId),
                        mobileText = $('input', $('#' + e.targetId).parent().next('label')),
                        checked = target.prop('checked');

                    if (checked) {
                        if (mobileText.hasClass('input-disabled')) mobileText.removeClass('input-disabled');
                        mobileText.attr('disabled', false);
                    } else {
                        if (!mobileText.hasClass('input-disabled')) mobileText.addClass('input-disabled');
                        mobileText.attr('disabled', true);
                    }
                }
            }
        },
        renderer: {
            remindTelCheck: {
                Cls: function (view) {
                    var rtc = view.vm.get('remindTelCheck');
                    return rtc ? '' : 'input-disabled';
                },
                Disabled: function (view) {
                    var rtc = view.vm.get('remindTelCheck');
                    return rtc ? '' : 'disabled';
                }
            },
            limitTelCheck: {
                Cls: function (view) {
                    var ltc = view.vm.get('limitTelCheck');
                    return ltc ? '' : 'input-disabled';
                },
                Disabled: function (view) {
                    var ltc = view.vm.get('limitTelCheck');
                    return ltc ? '' : 'disabled';
                }
            }
        }
    });
}, {
    requires: [
        'node',
        'mxext/view',
        'app/common/helpers/tmpl',
        "brix/core/mu",
        "brix/core/pagelet",
        "app/account/models/modelmanager",
        "json",
        "magix/router"
    ],
    cssRequires: [
        "brix/gallery/breadcrumbs/index",
        "brix/gallery/dropdown/index",
        "brix/gallery/loading/index",
        "components/form/index",
        "components/tips/index",
        "app/account/assets/css/common",
        "app/account/assets/css/remind"]
})