/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('app/views/brixes/dropdown', function(S, View, DropdownBrick) {
    var DropdownData = {
        dropdown_list: [{
            value: '1',
            text: '计划列表',
            selected: true,
            color: 'red'
        },
                    {
            value: '2',
            text: '计划列表2',
            color: 'red'
        },
                    {
            value: '3',
            text: '计划列表3',
            color: 'red'
        },
                    {
            value: '4',
            text: '计划列表4',
            color: 'red'
        }]
    };
    return View.extend({
        render: function() {
            var me = this;
            me.renderByPagelet({}, function(pagelet) {
                var config = {
                    container: '#test_container', //容器节点
                    tmpl: pagelet.getStoreTmpl('dropdown'), //需要的模板
                    data: DropdownData, //这个数据会被重新clone一份，所以更新原始数据不会对内部产生影响
                    events: { //自定义事件代理
                        '.dropdown-a': {
                            mousedown: function(e) {
                                /*alert(this);
                                    alert(1);*/
                            }
                        }
                    },
                    isRemoveEl: false
                };

                var dropdownBrick = new DropdownBrick(config);
                dropdownBrick.render();
                me.manage(dropdownBrick); //手动渲染的组件请调用manage让view进行自动管理
            });
        }
    });
}, {
    requires: ['mxext/view', 'brix/gallery/dropdown/index', 'brix/gallery/dropdown/index.css']
});