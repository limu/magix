/**
 * Magix Router 负责监控hash变化,并根据变化后的hash值path部分,分发给相应的controller模块.
 * @module	magix/router
 * @author limu@taobao.com
 * @reqiure "backbone"
 * @usage hash与模块对应关系规则:
 * 由"#!"开始最后一个斜线之前的部分为path,由对应app/controllers/path负责展现
 * 最后一个斜线之后的部分,对应参数对象,键值对将被解析为JS Object
 * hash为空时对应由config/init的indexPath属性指定首页controller
 * 响应controller没有找到,则由config/ini的notFoundPath属性指定404页面controller
 * 		"#!/x/" => path:"app/controllers/x" para:{}
 * 		"#!/x/a=1&b=2 => path:"app/controllers/x" para:{a:1,b:2}
 * 		"#!/y/z" => path:"app/controllers/y" para:{z:""}
 * 		"#!/y/z/" => path:"app/controllers/y/z" para:{}
 * 		"" => config/ini.indexPath
 * 		#!/notfound/ => config/ini.notFoundPath
 */
/**
 * MxRouter router构造器,传入config/ini后生成单例
 * @class MxRouter
 * @extend Backbone.Controller
 * @param {Object} options {config:ini}
 * @singleton
 */
/**
 * hash值解析后的包含path和para的对象
 * @property query
 * @type Object
 */
/**
 * 前一个页面的query对象,结构同query
 * @property referrer
 * @type Object
 */
/**
 * 初始化配置数据
 * @property config
 * @type Object
 */
define(function(require,exports,module){
    var Backbone = require("backbone");
	//router继承自Backbone.Controller,将其中router功能提取出来加以扩展,为hash生成query对象.
	//将每个页面的controller独立成单独的文件,同query.path一一对应,由router根据path载入对应controller运行
    var MxRouter = Backbone.Controller.extend({
        //生成实例,为config赋值
        initialize: function(o){
            this.config = o.config;
        },
        //hash值除去了开始的!部分,成为我们的原始query.
        routes: {
            "!*hash": "_route",
            "*hash": "_route"
        },
        //对原始hash进行parse.生成query和referrer.
        _route: function(hash){
            var i, tmpArr, paraArr, kv, k, v;
            
            this.referrer = this.query || null;
            
            this.query = {
                path: this.config.indexPath,
                para: {}
            };
            if (hash) {
                tmpArr = hash.split("/");
                paraArr = tmpArr.pop().split("&");
                this.query.path = tmpArr.join("/");
                for (i = 0; i < paraArr.length; i++) {
                    kv = paraArr[i].split("=");
                    this.query.para[kv[0]] = kv[1] || "";
                }
            }
            this._goto();
        },
        //调用当前query.path对应的controller,当controller模块不存在是使用404页面的controller.
        _goto: function(){
            var self = this;
            var controller;
            module.load("app/controllers" + self.query.path, function(Controller){
                if (Controller) {
                    controller = new Controller({
                        router: self
                    });
                }//query.path对应Controller不存在,说明页面notFound,展示404页面
                else {
                    module.load("app/controllers" + self.config.notFoundPath, function(Controller){
                        if (Controller) {
                            controller = new Controller({
                                router: self
                            });
                        }
                    });
                }
            });
            window.ctrl = controller;//todo del
        }
    });
	return MxRouter;
});
