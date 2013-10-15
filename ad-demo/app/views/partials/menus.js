KISSY.add('app/views/partials/menus', function(S, View) {
    return View.extend({
        init: function() {
            this.observeLocation({
                pathname: true
            });
        },
        render: function() {
            this.setViewHTML(this.template);
            //获取pathname,this.location由view的基类传入
            //pathname为"#!"之后,下一个"?"之前(如果有)的部分
            var pn = this.location.pathname || '/home';
            //this.id为当前view所在vframe的id
            //在vframe内寻找是否有目标为'#!'+pathname的链接
            var link = S.one('#' + this.id).one('a[href="#!' + pn + '"]');
            if (link) {
                //设置菜单高亮
                link.addClass('current');
                //如果菜单项为二级菜单,展现其所在ul,并设置正确的父级菜单之前的箭头方向.
                var topNav = link.parent('.topnav-list');
                var ul = topNav.one('ul');
                if (ul) {
                    ul.removeClass('none');
                    var arrow = topNav.one('i');
                    if (arrow) {
                        arrow.html('&#405');
                    }
                }
            }
        },
        locationChange: function(e) {
            this.render();
        },
        'toggleSubMenus<click>': function(e) {
            //获取被点击的标签A
            var target = S.one('#' + e.targetId);
            if (target[0].tagName == 'I') {
                target = target.parent();
            }
            //改变A的兄弟节点ul和A的子节点arrow的状态
            var ul = target.next('ul');
            var arrow = target.one('i');
            if (ul.hasClass('none')) {
                ul.removeClass('none');
                arrow.html('&#405');
            } else {
                ul.addClass('none');
                arrow.html('&#402');
            }
        }
    });
}, {
    requires: ['magix/view', 'node']
});