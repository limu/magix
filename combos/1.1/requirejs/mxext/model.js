/**
 * @fileOverview Model
 * @version 1.0
 * @author 行列
 */
define('mxext/model', ['magix/magix'], function(Magix) {

    var Extend = function(props, ctor) {
        var me = this;
        var BaseModel = function() {
            BaseModel.superclass.constructor.apply(this, arguments);
            if (ctor) {
                Magix.safeExec(ctor, arguments, this);
            }
        };

        Magix.mix(BaseModel, me, {
            prototype: true
        });

        return Magix.extend(BaseModel, me, props);

    };
    /**
 * Model类
 * @name Model
 * @namespace
 * @class
 * @constructor
 * @param {Object} ops 初始化Model时传递的其它参数对象
 * @property {String} id model唯一标识
 * @property {Boolean} fromCache 在与ModelManager配合使用时，标识当前model对象是不是从缓存中来
 */

var GUID = +new Date();
var Model = function(ops) {
    if (ops) {
        this.set(ops);
    }
    this.id = 'm' + GUID--;
};

var Encode = encodeURIComponent;

Magix.mix(Model, {
    /**
     * @lends Model
     */
    /**
     * GET枚举
     * @type {String}
     */
    GET: 'GET',
    /**
     * POST枚举
     * @type {String}
     */
    POST: 'POST',
    /**
     * 继承
     * @function
     * @param {Object} props 方法对象
     * @param {Function} ctor 继承类的构造方法
     */
    extend: Extend
});


Magix.mix(Model.prototype, {
    /**
     * @lends Model#
     */
    /**
     * url映射对象
     * @type {Object}
     */
    /*urlMap: {

    },*/
    /**
     * Model调用request方法后，与服务器同步的方法，供应用开发人员覆盖
     * @function
     * @param {Function} callback 请求完成后的回调，回调时第1个参数是错误对象，第2个是数据
     * @return {XHR} 最好返回异步请求的对象
     */
    sync: Magix.noop,
    /**
     * 处理Model.sync成功后返回的数据
     * @function
     * @param {Object|String} resp 返回的数据
     * @return {Object}
     */
    parse: function(r) {
        return r;
    },
    /**
     * 获取参数对象
     * @param  {String} [type] 参数分组的key[Model.GET,Model.POST]，默认为Model.GET
     * @return {Object}
     */
    /*getParamsObject:function(type){
            if(!type)type=Model.GET;
            return this['$'+type]||null;
        },*/
    /**
     * 获取参数对象
     * @return {Object}
     */
    /* getUrlParamsObject:function(){
            return this.getParamsObject(Model.GET);
        },*/
    /**
     * 获取Post参数对象
     * @return {Object}
     */
    /*getPostParamsObject:function(){
            return this.getParamsObject(Model.POST);
        },*/
    /**
     * 获取通过setPostParams放入的参数
     * @return {String}
     */
    getPostParams: function() {
        return this.getParams(Model.POST);
    },
    /**
     * 获取通过setUrlParams放入的参数
     * @return {String}
     */
    getUrlParams: function() {
        return this.getParams(Model.GET);
    },
    /**
     * 获取参数
     * @param {String} [type] 参数分组的key[Model.GET,Model.POST]，默认为Model.GET
     * @return {String}
     */
    getParams: function(type) {
        var me = this;
        if (!type) {
            type = Model.GET;
        } else {
            type = type.toUpperCase();
        }
        var k = '$' + type;
        var params = me[k];
        var arr = [];
        var v;
        if (params) {
            for (var p in params) {
                v = params[p];
                if (Magix.isArray(v)) {
                    for (var i = 0; i < v.length; i++) {
                        arr.push(p + '=' + Encode(v[i]));
                    }
                } else {
                    arr.push(p + '=' + Encode(v));
                }
            }
        }
        return arr.join('&');
    },
    /**
     * 设置url参数，只有未设置过的参数才进行设置
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     */
    setUrlParamsIf: function(obj1, obj2) {
        this.setParams(obj1, obj2, Model.GET, true);
    },
    /**
     * 设置post参数，只有未设置过的参数才进行设置
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     */
    setPostParamsIf: function(obj1, obj2) {
        var me = this;
        me.setParams(obj1, obj2, Model.POST, true);
    },
    /**
     * 设置参数
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     * @param {String}   type      参数分组的key
     * @param {Boolean}   ignoreIfExist   如果存在同名的参数则不覆盖，忽略掉这次传递的参数
     */
    setParams: function(obj1, obj2, type, ignoreIfExist) {
        if (!type) {
            type = Model.GET;
        } else {
            type = type.toUpperCase();
        }
        var me = this;
        if (!me.$types) me.$types = {};
        me.$types[type] = true;

        var k = '$' + type;
        if (!me[k]) me[k] = {};
        if (Magix.isObject(obj1)) {
            for (var p in obj1) {
                if (!ignoreIfExist || !me[k][p]) {
                    me[k][p] = obj1[p];
                }
            }
        } else if (obj1) {
            if (!ignoreIfExist || !me[k][obj1]) {
                me[k][obj1] = obj2;
            }
        }
    },
    /**
     * 设置post参数
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     */
    setPostParams: function(obj1, obj2) {
        var me = this;
        me.setParams(obj1, obj2, Model.POST);
    },
    /**
     * 设置url参数
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     */
    setUrlParams: function(obj1, obj2) {
        this.setParams(obj1, obj2, Model.GET);
    },
    /**
     * @private
     */
    /*removeParamsObject:function(type){
            if(!type)type=Model.GET;
            delete this['$'+type];
        },*/
    /**
     * @private
     */
    /*removePostParamsObject:function(){
            this.removeParamsObject(Model.POST);
        },*/
    /**
     * @private
     */
    /*removeUrlParamsObject:function(){
            this.removeParamsObject(Model.GET);
        },*/
    /**
     * 重置缓存的参数对象，对于同一个model反复使用前，最好能reset一下，防止把上次请求的参数也带上
     */
    reset: function() {
        var me = this;
        var keysCache = me.$types;
        if (keysCache) {
            for (var p in keysCache) {
                if (Magix.has(keysCache, p)) {
                    delete me['$' + p];
                }
            }
            delete me.$types;
        }
        var keys = me.$keys;
        var attrs = me.$attrs;
        if (keys) {
            for (var i = 0; i < keys.length; i++) {
                delete attrs[keys[i]];
            }
            delete me.$keys;
        }
    },
    /**
     * 获取属性
     * @param {String} [key] 要获取数据的key
     * @param {Object} [dValue] 当根据key取到的值为falsy时，使用默认值替代，防止代码出错
     * @return {Object}
     * @example
     * MM.fetchAll({
     *     name:'Test'
     * },function(e,m){
     *     var obj=m.get();//获取所有数据
     *
     *     var list=m.get('list',[]);//获取list数据，如果不存在list则使用空数组
     *
     * });
     */
    get: function(key, dValue) {
        var me = this;
        var alen = arguments.length;
        var getAll = !alen;
        var hasDValue = alen == 2;
        var attrs = me.$attrs;
        if (attrs) {
            attrs = getAll ? attrs : attrs[key];
        }
        if (hasDValue && !attrs) {
            attrs = dValue;
        }
        return attrs;
    },
    /**
     * 设置属性
     * @param {String|Object} key 属性对象或属性key
     * @param {Object} [val] 属性值
     */
    set: function(key, val, saveKeyList) {
        var me = this;
        if (!me.$attrs) me.$attrs = {};
        if (saveKeyList && !me.$keys) {
            me.$keys = [];
        }
        if (Magix.isObject(key)) {
            if (!Magix.isObject(val)) {
                val = {};
            }
            for (var p in key) {
                if (saveKeyList) {
                    me.$keys.push(p);
                }
                if (!Magix.has(val, p)) {
                    me.$attrs[p] = key[p];
                }
            }
        } else if (key) {
            if (saveKeyList) {
                me.$keys.push(key);
            }
            me.$attrs[key] = val;
        }
    },
    /**
     * 向服务器请求，加载或保存数据
     * @param {Function} callback 请求成功或失败的回调
     */
    request: function(callback, options) {
        if (!callback) callback = function() {};
        var me = this;
        me.$abort = false;
        var temp = function(err, data) {
            if (!me.$abort) {
                if (err) {
                    callback(err, data, options);
                } else {
                    if (data) {
                        var val = me.parse(data);
                        if (!Magix.isObject(val)) {
                            val = {
                                data: val
                            };
                        }
                        me.set(val, null, true);
                    }
                    callback(err, data, options);
                }
            } else {
                callback('abort', null, options);
            }
        };
        me.$trans = me.sync(temp);
    },
    /**
     * 中止请求
     */
    abort: function() {
        var me = this;
        var trans = me.$trans;
        if (trans && trans.abort) {
            trans.abort();
        }
        delete me.$trans;
        me.$abort = true;
    },
    /**
     * 获取当前model是否已经取消了请求
     * @return {Boolean}
     */
    isAborted: function() {
        return this.$abort;
    }
});
    return Model;
});