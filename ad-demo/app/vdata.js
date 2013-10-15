/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('app/vdata', function(S, View) {
    var ViewData = function(config) {
        ViewData.superclass.constructor.call(this, config);
        this.addAttrs(config);
    };

    S.extend(ViewData, S.Base, {
        /**
         * @lends ViewData#
         */
        /**
         * 注册模板帮助方法
         * @param {Object} obj 包含方法的对象
         **/
        registerRenderers: function(obj) {
            var me = this;
            var baseSet = me.constructor.superclass.set;
            for (var group in obj) {
                var groups = obj[group];
                for (var n in groups) {
                    baseSet.call(me, group + '_' + n, (function(f) {
                        return function() {
                            return f.call(this, me._view);
                        };
                    }(groups[n])), {
                        slient: true
                    });
                }
            }
        },
        /**
         * 你懂的
         * @return {Object}
         */
        toJSON: function() {
            return this.getAttrVals();
        }
    });
    return View.mixin({

    }, function() {
        this.data = new ViewData();
    });
}, {
    requires: ['magix/view', 'base']
});