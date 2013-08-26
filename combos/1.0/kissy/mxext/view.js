/**
 * @fileOverview 对magix/view的扩展
 * @version 1.0
 * @author 行列
 */
KISSY.add('mxext/view', function(S, Magix, View, Router) {
    var WIN = window;

var DestroyTimer = function(id) {
    WIN.clearTimeout(id);
    WIN.clearInterval(id);
};

var Destroy = function(res) {
    SafeExec(res.destroy, [], res);
};

var ResCounter = 0;
var SafeExec = Magix.safeExec;
var Has = Magix.has;
var VOMEventsObject = {};
var PrepareVOMMessage = function(vom) {
    if (!PrepareVOMMessage.d) {
        PrepareVOMMessage.d = 1;
        vom.on('add', function(e) {
            var vf = e.vframe;
            var list = VOMEventsObject[vf.id];
            if (list) {
                for (var i = 0; i < list.length; i++) {
                    PostMessage(vf, list[i]);
                }
                delete VOMEventsObject[vf.id];
            }
        });
        vom.on('remove', function(e) {
            delete VOMEventsObject[e.vframe.id];
        });
        var vf = vom.root();
        vf.on('created', function() {
            VOMEventsObject = {};
        });
    }
};
var PostMessage = function(vframe, args) {
    var view = vframe.view;
    if (view && vframe.viewInited) {
        SafeExec(view.receiveMessage, args, view);
    } else {
        var interact = function(e) {
            vframe.un('viewInited', interact);
            SafeExec(e.view.receiveMessage, args, e.view);
        };
        vframe.on('viewInited', interact);
    }
};
/**
 * @name MxView
 * @namespace
 * @requires View
 * @augments View
 */
var MxView = View.extend({
    /**
     * @lends MxView#
     */
    /**
     * 当前view实例化后调用，供子类重写
     * @function
     */
    mxViewCtor: Magix.noop, //供扩展用
    /**
     * 调用magix/router的navigate方法
     */
    navigate: function() {
        Router.navigate.apply(Router, arguments);
    },
    /**
     * 让view帮你管理资源，<b>强烈建议对组件等进行托管</b>
     * @param {String|Object} key 托管的资源或要共享的资源标识key
     * @param {Object} res 要托管的资源
     * @return {Object} 返回传入的资源，对于函数会自动进行一次包装
     * @example
     * init:function(){
     *      this.manage('user_list',[//管理对象资源
     *          {id:1,name:'a'},
     *          {id:2,name:'b'}
     *      ]);
     * },
     * render:function(){
     *      var _self=this;
     *      var m=new Model();
     *      m.load({
     *          success:function(resp){
     *              //TODO
     *              var brix=new BrixDropdownList();
     *
     *              _self.manage(brix);//管理组件
     *
     *              var pagination=_self.manage(new BrixPagination());//也可以这样
     *
     *              var timer=_self.manage(setTimeout(function(){
     *                  S.log('timer');
     *              },2000));//也可以管理定时器
     *
     *
     *              var userList=_self.getManaged('user_list');//通过key取托管的资源
     *
     *              S.log(userList);
     *          },
     *          error:function(msg){
     *              //TODO
     *          }
     *      });
     *
     *      _self.manage(m);
     * }
     */
    manage: function(key, res) {
        var me = this;
        var args = arguments;
        var hasKey = true;
        if (args.length == 1) {
            res = key;
            key = 'res_' + (ResCounter++);
            hasKey = false;
        }
        if (!me.$res) me.$res = {};
        var destroy;
        if (Magix.isNumber(res)) {
            destroy = DestroyTimer;
        } else if (res && res.destroy) {
            destroy = Destroy;
        }
        var wrapObj = {
            hasKey: hasKey,
            res: res,
            destroy: destroy
        };
        me.$res[key] = wrapObj;
        return res;
    },
    /**
     * 获取托管的资源
     * @param {String} key 托管资源时传入的标识key
     * @return {Object}
     */
    getManaged: function(key) {
        var me = this;
        var cache = me.$res;
        var sign = me.sign;
        if (cache && Has(cache, key)) {
            var wrapObj = cache[key];
            var resource = wrapObj.res;
            return resource;
        }
        return null;
    },
    /**
     * 移除托管的资源
     * @param {String|Object} param 托管时标识key或托管的对象
     * @return {Object} 返回移除的资源
     */
    removeManaged: function(param) {
        var me = this,
            res = null;
        var cache = me.$res;
        if (cache) {
            if (Has(cache, param)) {
                res = cache[param].res;
                delete cache[param];
            } else {
                for (var p in cache) {
                    if (cache[p].res === param) {
                        res = cache[p].res;
                        delete cache[p];
                        break;
                    }
                }
            }
        }
        return res;
    },
    /**
     * 销毁托管的资源
     * @private
     */
    destroyManaged: function(e) {
        var me = this;
        var cache = me.$res;
        //
        if (cache) {
            for (var p in cache) {
                var o = cache[p];
                //var processed=false;
                var res = o.res;
                var destroy = o.destroy;
                var processed = false;
                if (destroy) {
                    destroy(res);
                    processed = true;
                }
                if (!o.hasKey) { //如果托管时没有给key值，则表示这是一个不会在其它方法内共享托管的资源，view刷新时可以删除掉
                    delete cache[p];
                }
                me.fire('destroyManaged', {
                    resource: res,
                    processed: processed
                });
            }
            if (e.type == 'destroy') { //如果不是刷新，则是view的销毁
                //me.un('destroyResource');
                delete me.$res;
            }
        }
    },
    /**
     * 用于接受其它view通过postMessageTo方法发来的消息，供最终的view开发人员进行覆盖
     * @function
     * @param {Object} e 通过postMessageTo传递的第二个参数
     */
    receiveMessage: Magix.noop,
    /**
     * 向某个vframe发送消息
     * @param {Array|String} aims  目标vframe id数组
     * @param {Object} args 消息对象
     */
    postMessageTo: function(aims, args) {
        var vom = this.vom;
        PrepareVOMMessage(vom);

        if (!Magix.isArray(aims)) {
            aims = [aims];
        }
        if (!args) args = {};
        for (var i = 0, it; i < aims.length; i++) {
            it = aims[i];
            var vframe = vom.get(it);
            if (vframe) {
                PostMessage(vframe, args);
            } else {
                if (!VOMEventsObject[it]) {
                    VOMEventsObject[it] = [];
                }
                VOMEventsObject[it].push(args);
            }
        }
    },
    /**
     * @private
     */
    destroyMRequest: function() {
        var me = this;
        var cache = me.$res;
        if (cache) {
            for (var p in cache) {
                var o = cache[p];
                var res = o.res;
                if (res && res.fetchOne && res.fetchAll) { //销毁MRequest
                    res.destroy();
                    delete cache[p];
                }
            }
        }
    }
}, function() {
    var me = this;
    me.beginUpdateHTML = me.beginUpdate;
    me.endUpdateHTML = me.endUpdate; //兼容线上，这2行不要删除
    me.on('interact', function() {
        me.on('rendercall', me.destroyMRequest);
        me.on('prerender', me.destroyManaged);
        me.on('destroy', me.destroyManaged);
    });
    me.mxViewCtor();
});

/**
 * view销毁托管资源时发生
 * @name MxView#destroyResource
 * @event
 * @param {Object} e
 * @param {Object} e.resource 托管的资源
 * @param {Boolean} e.processed 表示view是否对这个资源做过销毁处理，目前view仅对带 abort destroy dispose方法的资源进行自动处理，其它资源需要您响应该事件自已处理
 */
    return MxView;
}, {
    requires: ["magix/magix", "magix/view", "magix/router"]
});