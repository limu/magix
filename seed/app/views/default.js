KISSY.add("app/views/default", function(S, View, VOM, UA, Node) {
    return View.extend({
        init: function() {
            var me = this;
            //me.on('__PAHTNAME__',)
            //observePathname
            //ovserveParams

            //me.observeLocation('',PATHNAME);

            //me.observeLocation(['name','page']);
            //1 数据预读取
            //2.事件绑定
            //3. observe
            //4. context 当前view所需的template已准备好（如果有）
            me.observeLocation({
                pathname: true
            });
            if (UA.ie < 8) {
                me.fixLowerIE();
                me.on('destroy', function() {
                    me.unfixLowerIE();
                });
            }
            me.on('alter', function(e) {
                //console.log('正在加载页面...');
                //bar.show('正在加载页面...');
            });
            me.on('created', function(e) {
                //bar.hide()
            });
        },
        /**
         * 兼容低版本的IE
         * @param  {String|HTMLElement} zone 修正的区块
         */
        fixLowerIE: function() {
            var zone = S.one(document.body);
            var focus = function(e) {
                S.one(e.target).addClass('focus');
            };
            var blur = function(e) {
                S.one(e.target).removeClass('focus');
            };

            zone.delegate('focusin', 'input,textarea', this.$ieFocus = focus);
            zone.delegate('focusout', 'input,textarea', this.$ieBlur = blur);
        },
        unfixLowerIE: function(zone) {
            var zone = S.one(document.body);
            zone.undelegate('focusin', 'input,textarea', this.$ieFocus);
            zone.undelegate('focusout', 'input,textarea', this.$ieBlur);
        },
        render: function() {
            var me = this;
            console.log(this);
            me.setViewPagelet({
                //数据对象
            }, function() {
                me.mountMainFrame();
            });
        },
        mountMainFrame: function() {
            var me = this;
            var loc = me.location;
            console.log(loc);
            var pathname = loc.pathname;
            var vframe = VOM.get('magix_vf_main');
            if (vframe) {
                var pns = pathname.split('/');
                pns.shift();
                var folder = pns.shift() || 'home';
                var view = pns.join('/') || 'index';
                if (S.endsWith(view, '/')) {
                    view += 'index';
                }
                var viewPath = 'app/views/' + folder + '/' + view;
                console.log(viewPath);
                vframe.mountView(viewPath);
            }
        },
        locationChange: function(e) {
            this.mountMainFrame();
            e.toChildren('magix_vf_menu,magix_vf_header');
        }
    });
}, {
    requires: ['mxext/view', 'magix/vom', 'ua', 'node']
})