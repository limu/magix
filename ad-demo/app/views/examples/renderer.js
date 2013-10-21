/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('app/views/examples/renderer', function(S, View, MM) {
    return View.extend({
        init: function() {
            this.observeLocation('sortkey,sortby'); //从magix1.1起，关注某些参数后，会自动刷新该view
            this.data.registerRenderers({
                list: {
                    type: function(view) {
                        return '类型' + this.type;
                    },
                    onlineState: function() {
                        if (this.onlineState == 1) {
                            return '在线';
                        }
                        return '不在线';
                    }
                }
            });
        },
        render: function() {
            var me = this;
            MM.fetchAll({
                name: 'Table_Sortable_Data'
            }, function(e, m) {
                if (e) {
                    me.setViewHTML(e.msg);
                } else {
                    var list = m.get('list');
                    var loc = me.location;
                    var sortby = loc.get('sortby');
                    var sortkey = loc.get('sortkey');
                    if (sortby && sortkey) { //地址栏中存在sortby和sortkey
                        list.sort(function(a, b) { //直接调用数据的sort方法进行排序
                            var aValue = a[sortkey];
                            var bValue = b[sortkey];
                            aValue = parseInt(aValue.substring(0, aValue.length - 1), 10); //因示例中折扣是类似90%这样的字符串，因此去掉%号并转成整数
                            bValue = parseInt(bValue.substring(0, bValue.length - 1), 10);
                            if (sortby == 'asc') { //根据排序要求，进行相应的升序降序排序
                                return aValue - bValue;
                            } else {
                                return bValue - aValue;
                            }
                        });
                    }
                    var data = me.data;
                    data.set({
                        list: list,
                        sortDesc: sortby == 'desc'
                    });

                    me.renderByPagelet(data.toJSON());
                }
            }, me);
        },
        'sort<click>': function(e) {
            var view = this; //获取view对象
            var loc = view.location;
            var sortby = loc.get('sortby'); //获取地址栏当前存放的sortby参数，如果地址栏不存在则为undefined
            if (sortby == 'desc') {
                sortby = 'asc';
            } else {
                sortby = 'desc';
            }
            var sortkey = e.params.key; //获取按哪个字段进行排序
            view.navigate({ //通过Router的navigate改变地址栏上的参数
                sortkey: sortkey,
                sortby: sortby
            });
        }
    });
}, {
    requires: ['mxext/view', 'app/models/manager', 'brix/gallery/tables/index.css']
});