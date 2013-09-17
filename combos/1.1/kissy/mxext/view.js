/**
 * @fileOverview 对magix/view的扩展
 * @version 1.0
 * @author 行列
 */
KISSY.add('mxext/view', function(S, Magix, View, Router) {
    var WIN = window;
var Mix = Magix.mix;
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
            sign: me.sign,
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
        if (cache && Has(cache, param)) {
            res = cache[param].res;
            delete cache[param];
        }
        return res;
    },
    /**
     * 销毁托管的资源
     * @private
     */
    destroyManaged: function() {
        var me = this;
        var cache = me.$res;
        //
        if (cache) {
            for (var p in cache) {
                var o = cache[p];
                if (o.sign != me.sign) {
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
    me.on('interact', function() {
        me.on('rendercall', me.destroyMRequest);
        me.on('prerender', me.destroyManaged);
        me.on('destroy', me.destroyManaged);
    });
    SafeExec(MxView.ms, arguments, me);
}, {
    ms: [],
    mixin: function(props, ctor) {
        MxView.ms.push(ctor);
        Mix(MxView.prototype, props);
    }
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