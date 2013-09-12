/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.0
 **/
KISSY.add("mxext/mmanager", function(S, Magix, Event) {
    /*
        #begin example-1#
        KISSY.add('testMM',function(S,MM,Model){
            var TestMM=MM.create(Model);
            TestMM.registerModels([{
                name:'Test1',
                url:'/api/test1.json'
            },{
                name:'Test2',
                url:'/api/test2.json',
                urlParams:{
                    type:'2'
                }
            }]);
            return TestMM;
        },{
            requires:["mxext/mmanager","mxext/model"]
        });

        KISSY.use('testMM',function(S,TM){
            TM.fetchAll([{
                name:'Test1'
            },{
                name:'Test2'
            }],function(m1,m2,err){

            });
        });
        #end#
     */
    var Has = Magix.has;
var SafeExec = Magix.safeExec;
var Mix = Magix.mix;
/**
 * Model管理对象，可方便的对Model进行缓存和更新
 * @name MManager
 * @class
 * @namespace
 * @param {Model} modelClass Model类
 */
var MManager = function(modelClass) {
    var me = this;
    me.$mClass = modelClass;
    me.$mCache = Magix.cache();
    me.$mCacheKeys = {};
    me.$mMetas = {};
};

var Slice = [].slice;
var WhiteList = {
    urlParams: 1,
    postParams: 1,
    cacheKey: 1,
    cacheTime: 1,
    before: 1,
    after: 1
};

var WrapDone = function(fn, model, idx) {
    return function() {
        return fn.apply(model, [model, idx].concat(Slice.call(arguments)));
    }
};
var UsedModel = function(m, f) {
    if (f) {
        for (var i = m.length - 1; i > -1; i--) {
            UsedModel(m[i]);
        }
    } else {
        var mm = m.$mm;
        if (!m.fromCache && mm.used > 0) {
            m.fromCache = true;
        }
        mm.used++;
    }
};
Mix(MManager, {
    /**
     * @lends MManager
     */
    /**
     * 创建Model类管理对象
     * @param {Model} modelClass Model类
     */
    create: function(modelClass) {
        var me = this;
        if (!modelClass) {
            throw Error('MManager.create:modelClass ungiven');
        }
        return new MManager(modelClass);
    }
});
var FetchFlags = {
    ALL: 1,
    ONE: 2,
    ORDER: 4
};
var Now = Date.now || function() {
        return +new Date()
    };
/**
 * model请求类
 * @name MRequest
 * @class
 * @namespace
 * @param {MManager} host
 */
var MRequest = function(host) {
    this.$host = host;
    this.$doTask = false;
    this.$reqModels = {};
};

var BEFORE = '_before';
var AFTER = '_after';

Mix(MRequest.prototype, {
    /**
     * @lends MRequest#
     */
    /**
     * 发送models请求，该用缓存的用缓存，该发起请求的请求
     * @private
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2},params:[]}
     * @param {Function} done   完成时的回调
     * @param {Integer} flag   获取哪种类型的models
     * @param {Boolean} save 是否是保存的动作
     * @return {MRequest}
     */
    send: function(models, done, flag, save) {
        var me = this;
        if (me.$doTask) {
            me.next(function(request) {
                request.send(models, done, flag, save);
            });
            return me;
        }
        me.$doTask = true;

        var host = me.$host;
        var modelsCache = host.$mCache;
        var modelsCacheKeys = host.$mCacheKeys;
        var reqModels = me.$reqModels;

        if (!Magix.isArray(models)) {
            models = [models];
        }
        var total = models.length;
        var current = 0;
        var errorMsg;
        var hasError;

        var doneArr = new Array(total);
        var doneArgs = [];
        var errorArgs = {};
        var orderlyArr = [];

        var doneIsArray = Magix.isArray(done);
        if (doneIsArray) {
            doneArgs = new Array(done.length);
        }
        var doneFn = function(model, idx, data, err) {
            if (me.$destroy) return; //销毁，啥也不做
            current++;
            delete reqModels[model.id];
            var mm = model.$mm;
            var cacheKey = mm.cacheKey;
            doneArr[idx] = model;
            if (err) {
                hasError = true;
                errorMsg = err;
                errorArgs[idx] = data;
            } else {
                if (!cacheKey || (cacheKey && !modelsCache.has(cacheKey))) {
                    if (cacheKey) {
                        modelsCache.set(cacheKey, model);
                    }
                    mm.doneAt = Now();
                    var after = mm.after;
                    var meta = mm.meta;

                    if (after) { //有after
                        SafeExec(after, [model, meta]);
                    }
                    host.fireAfter(meta.name, [model]);
                }
            }

            if (flag == FetchFlags.ONE) { //如果是其中一个成功，则每次成功回调一次
                var m = doneIsArray ? done[idx] : done;
                if (m) {
                    UsedModel(model);
                    doneArgs[idx] = SafeExec(m, [model, hasError ? {
                        msg: errorMsg
                    } : null, hasError ? errorArgs : null], me);
                }
            } else if (flag == FetchFlags.ORDER) {
                //var m=doneIsArray?done[idx]:done;
                orderlyArr[idx] = {
                    m: model,
                    e: hasError,
                    s: errorMsg
                };
                //
                for (var i = orderlyArr.i || 0, t, d; t = orderlyArr[i]; i++) {
                    d = doneIsArray ? done[i] : done;
                    UsedModel(t.m);
                    doneArgs[i] = SafeExec(d, [t.m, t.e ? {
                        msg: t.s
                    } : null, orderlyArr.e ? errorArgs : null, doneArgs], me);
                    if (t.e) {
                        errorArgs[i] = t.s;
                        orderlyArr.e = 1;
                    }
                }
                orderlyArr.i = i;
            }


            if (current >= total) {
                errorArgs.msg = errorMsg;
                var last = hasError ? errorArgs : null;
                if (flag == FetchFlags.ALL) {
                    UsedModel(doneArr, 1);
                    doneArr.push(last);
                    doneArgs[0] = SafeExec(done, doneArr, me);
                    doneArgs[1] = last;
                } else {
                    doneArgs.push(last);
                }
                me.$ntId = setTimeout(function() { //前面的任务可能从缓存中来，执行很快
                    me.doNext(doneArgs);
                }, 30);
            }

            if (cacheKey && Has(modelsCacheKeys, cacheKey)) {
                var fns = modelsCacheKeys[cacheKey].q;
                delete modelsCacheKeys[cacheKey];
                SafeExec(fns, [data, err], model);
            }

        };
        //

        for (var i = 0, model; i < models.length; i++) {
            model = models[i];
            if (model) {
                var modelEntity, modelInfo;
                var modelInfo = host.getModel(model, save);
                var cacheKey = modelInfo.cacheKey;
                modelEntity = modelInfo.entity;
                var wrapDoneFn = WrapDone(doneFn, modelEntity, i);

                if (cacheKey && Has(modelsCacheKeys, cacheKey)) {
                    modelsCacheKeys[cacheKey].q.push(wrapDoneFn);
                } else {
                    if (modelInfo.needUpdate) {
                        reqModels[modelEntity.id] = modelEntity;
                        if (cacheKey) {
                            modelsCacheKeys[cacheKey] = {
                                q: [],
                                e: modelEntity
                            };
                        }
                        modelEntity.request(wrapDoneFn);
                    } else {
                        wrapDoneFn();
                    }
                }
            } else {
                throw Error('miss attrs:' + models);
            }
        }
        return me;
    },
    /**
     * 获取models，所有请求完成回调done
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     * @example
            
        KISSY.add('testMM',function(S,MM,Model){
            var TestMM=MM.create(Model);
            TestMM.registerModels([{
                name:'Test1',
                url:'/api/test1.json'
            },{
                name:'Test2',
                url:'/api/test2.json',
                urlParams:{
                    type:'2'
                }
            }]);
            return TestMM;
        },{
            requires:["mxext/mmanager","mxext/model"]
        });

        KISSY.use('testMM',function(S,TM){
            TM.fetchAll([{
                name:'Test1'
            },{
                name:'Test2'
            }],function(m1,m2,err){

            });
        });
        
     */
    fetchAll: function(models, done) {
        return this.send(models, done, FetchFlags.ALL);
    },
    /**
     * 保存models，所有请求完成回调done
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveAll: function(models, done) {
        return this.send(models, done, FetchFlags.ALL, 1);
    },
    /**
     * 获取models，按顺序执行回调done
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    fetchOrder: function(models, done) {
        var cbs = Slice.call(arguments, 1);
        return this.send(models, cbs.length > 1 ? cbs : done, FetchFlags.ORDER);
    },
    /**
     * 保存models，按顺序执行回调done
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveOrder: function(models, done) {
        var cbs = Slice.call(arguments, 1);
        return this.send(models, cbs.length > 1 ? cbs : done, FetchFlags.ORDER, 1);
    },
    /**
     * 保存models，其中任意一个成功均立即回调，回调会被调用多次
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    saveOne: function(models, callback) {
        var cbs = Slice.call(arguments, 1);
        return this.send(models, cbs.length > 1 ? cbs : callback, FetchFlags.ONE, 1);
    },
    /**
     * 获取models，其中任意一个成功均立即回调，回调会被调用多次
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    fetchOne: function(models, callback) {
        var cbs = Slice.call(arguments, 1);
        return this.send(models, cbs.length > 1 ? cbs : callback, FetchFlags.ONE);
    },
    /**
     * 中止所有model的请求
     * 注意：调用该方法后会中止请求，并回调error方法
     */
    abort: function() {
        var me = this;
        clearTimeout(me.$ntId);
        var host = me.$host;
        var reqModels = me.$reqModels;
        var modelsCacheKeys = host.$mCacheKeys;

        if (reqModels) {
            for (var p in reqModels) {
                var m = reqModels[p];
                var cacheKey = m.$mm.cacheKey;
                if (cacheKey && Has(modelsCacheKeys, cacheKey)) {
                    var fns = modelsCacheKeys[cacheKey].q;
                    delete modelsCacheKeys[cacheKey];
                    if (!me.$destroy) {
                        SafeExec(fns, [null, 'aborted'], m);
                    }
                }
                m.abort();
            }
        }
        me.$reqModels = {};
        me.$queue = [];
        me.$doTask = false;
    },
    /**
     * 前一个fetchX或saveX任务做完后的下一个任务
     * @param  {Function} fn 回调
     * @return {MRequest}
     */
    next: function(fn) {
        var me = this;
        if (!me.$queue) me.$queue = [];
        me.$queue.push(fn);
        if (!me.$doTask) {
            var args = me.$latest || [];
            me.doNext.apply(me, [me].concat(args));
        }
        return me;
    },
    /**
     * 做下一个任务
     * @private
     */
    doNext: function(preArgs) {
        var me = this;
        me.$doTask = false;
        var queue = me.$queue;
        if (queue) {
            var one = queue.shift();
            if (one) {
                SafeExec(one, [me].concat(preArgs), me);
            }
        }
        me.$latest = preArgs;
    },
    /**
     * 销毁当前请求，与abort的区别是：abort后还可以继续发起新请求，而destroy后则不可以，而且不再回调相应的error方法
     */
    destroy: function() {
        var me = this;
        me.$destroy = true;
        me.abort();
    }
});

Mix(MManager.prototype, {
    /**
     * @lends MManager#
     */
    /**
     * 注册APP中用到的model
     * @param {Object|Array} models 模块描述信息
     * @param {String} models.name app中model的唯一标识
     * @param {Object} models.options 传递的参数信息，如{uri:'test',isJSONP:true,updateIdent:true}
     * @param {Object} models.urlParams 发起请求时，默认的get参数对象
     * @param {Object} models.postParams 发起请求时，默认的post参数对象
     * @param {String} models.cacheKey 指定model缓存的key，当指定后，该model会进行缓存，下次不再发起请求
     * @param {Integer} models.cacheTime 缓存过期时间，以毫秒为单位，当过期后，再次使用该model时会发起新的请求(前提是该model指定cacheKey被缓存后cacheTime才有效)
     * @param {Function} models.before model在发起请求前的回调
     * @param {Function} models.after model在请求结束，并且成功后的回调
     */
    registerModels: function(models) {
        /*
                name:'',
                options:{
                    uri:'',
                    jsonp:'true'
                },
                urlParams:'',
                postParams:'',
                cacheTime:20000,//缓存多久
                before:function(m){

                },
                after:function(m){

                }
             */
        var me = this;
        var metas = me.$mMetas;

        if (!Magix.isArray(models)) {
            models = [models];
        }
        for (var i = 0, model, name; i < models.length; i++) {
            model = models[i];
            name = model.name;
            if (model && !name) {
                throw Error('miss name attribute');
            } else if (metas[name]) { //兼容线上，存在同名时，不要抛错
                //KEEPCONSOLE.warn('already exist:' + name);
            }
            metas[name] = model;
        }
    },
    /**
     * 注册方法，前面是参数，后面2个是成功和失败的回调
     * @param {Object} methods 方法对象
     */
    registerMethods: function(methods) {
        var me = this;
        Mix(me, methods);
    },
    /**
     * 调用当前Manager注册的多个方法
     * @param {Array} args 要调用的方法列表，形如：[{name:'x',params:['o']},{name:'y',params:['z']}]
     * @param {Function} done 成功时的回调，传入参数跟args数组中对应的成功方法的值
     * @param {Function} error 失败回调，参数同上
     * @return {Object} 返回一个带abort方法的对象，用于取消这些方法的调用
     * @example
     * var MM=MManager.create(Model);
     * MM.registerMethods({
     *     methodA:function(args,done,error){
     *
     *     },
     *     methodB:function(args,done,error){
     *
     *     }
     * });
     *
     * //...
     * //使用时：
     *
     * MM.callMethods([
     *     {name:'methodA',params:['a']},
     *     {name:'methodB',params:['b']}
     * ],function(f1Result,f2Result){
     *
     * },function(msg){
     *     alert(msg)
     * })
     */
    /*callMethods:function(args,done,error){
            var me=this,
                doneArgs=[],
                errorMsg='',
                total=args.length,
                exec= 0,
                aborted,
                doneCheck=function(args,idx,isFail){
                    if(aborted)return;
                    exec++;
                    if(isFail){
                        errorMsg=args;
                    }else{
                         doneArgs[idx]=args;
                    }
                    if(total<=exec){
                        if(!errorMsg){
                            if(S.isFunction(done)){
                                done.apply(done,doneArgs);
                            }
                        }else{
                            if(S.isFunction(error)){
                                error(errorMsg);
                            }
                        }
                    }
                },
                check=function(idx,isSucc){
                    return function(args){
                        doneCheck(args,idx,!isSucc);
                    };
                };
            for(var i=0,one;i<args.length;i++){
                one=args[i];
                var fn;
                if(S.isFunction(one.name)){
                    fn=one.name;
                }else{
                    fn=me[one.name];
                }
                if(fn){
                    if(!one.params)one.params=[];
                    if(!S.isArray(one.params))one.params=[one.params];

                    one.params.push(check(i,true),check(i));
                    fn.apply(me,one.params);
                }else{
                    doneCheck('unfound:'+one.name,i,true);
                }
            }
            return {
                abort:function(){
                    aborted=true;
                }
            }
        },*/
    /**
     * 创建model对象
     * @param {Object} modelAttrs           model描述信息对象
     * @return {Object}
     */
    createModel: function(modelAttrs) {
        var me = this;
        var meta = me.getModelMeta(modelAttrs);

        var entity = new me.$mClass();
        entity.set(meta, WhiteList);
        entity.$mm = {
            used: 0
        };
        var before = modelAttrs.before || meta.before;

        me.fireBefore(meta.name, [entity]);

        if (Magix.isFunction(before)) {
            SafeExec(before, [entity, meta, modelAttrs]);
        }

        var after = modelAttrs.after || meta.after;

        entity.$mm.after = after;

        var cacheKey = modelAttrs.cacheKey || meta.cacheKey;

        if (Magix.isFunction(cacheKey)) {
            cacheKey = SafeExec(cacheKey, [meta, modelAttrs]);
        }

        entity.$mm.cacheKey = cacheKey;
        entity.$mm.meta = meta;
        entity.set(modelAttrs, WhiteList);
        //默认设置的
        entity.setUrlParams(meta.urlParams);
        entity.setPostParams(meta.postParams);

        //临时传递的
        entity.setUrlParams(modelAttrs.urlParams);
        entity.setPostParams(modelAttrs.postParams);

        return entity;
    },
    /**
     * 获取model注册时的元信息
     * @param  {String|Object} modelAttrs 名称
     * @return {Object}
     * @throws {Error} If unfound:name
     */
    getModelMeta: function(modelAttrs) {
        var me = this;
        var metas = me.$mMetas;
        var name;
        if (Magix.isString(modelAttrs)) {
            name = modelAttrs;
        } else {
            name = modelAttrs.name;
        }
        var meta = metas[name];
        if (!meta) {
            throw Error('Not found:' + modelAttrs.name);
        }
        return meta;
    },
    /**
     * 获取model对象，优先从缓存中获取
     * @param {Object} modelAttrs           model描述信息对象
     * @param {Boolean} createNew 是否是创建新的Model对象，如果否，则尝试从缓存中获取
     * @return {Object}
     */
    getModel: function(modelAttrs, createNew) {
        var me = this;
        var entity;
        var needUpdate;
        if (!createNew) {
            entity = me.getCachedModel(modelAttrs);
        }

        if (!entity) {
            needUpdate = true;
            entity = me.createModel(modelAttrs);
        }
        return {
            entity: entity,
            cacheKey: entity.$mm.cacheKey,
            needUpdate: needUpdate
        }
    },
    /**
     * 保存models，所有请求完成回调done
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveAll: function(models, done) {
        return new MRequest(this).saveAll(models, done);
    },
    /**
     * 获取models，所有请求完成回调done
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    fetchAll: function(models, done) {
        return new MRequest(this).fetchAll(models, done);
    },
    /**
     * 保存models，按顺序回回调done
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    saveOrder: function(models, done) {
        var mr = new MRequest(this);
        return mr.saveOrder.apply(mr, arguments);
    },
    /**
     * 获取models，按顺序回回调done
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {MRequest}
     */
    fetchOrder: function(models, done) {
        var mr = new MRequest(this);
        return mr.fetchOrder.apply(mr, arguments);
    },
    /**
     * 保存models，其中任意一个成功均立即回调，回调会被调用多次
     * @param {String|Array} models 保存models时的描述信息，如:{name:'Home',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    saveOne: function(models, callback) {
        var mr = new MRequest(this);
        return mr.saveOne.apply(mr, arguments);
    },
    /**
     * 获取models，其中任意一个成功均立即回调，回调会被调用多次
     * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {MRequest}
     */
    fetchOne: function(models, callback) {
        var mr = new MRequest(this);
        return mr.fetchOne.apply(mr, arguments);
    },
    /**
     * 根据key清除缓存的models
     * @param  {String} key 字符串
     */
    clearCacheByKey: function(key) {
        var me = this;
        var modelsCache = me.$mCache;
        modelsCache.del(key);
    },
    /**
     * 根据name清除缓存的models
     * @param  {String} name 字符串
     */
    clearCacheByName: function(name) {
        var me = this;
        var modelsCache = me.$mCache;
        var test;
        var list = modelsCache.c;
        for (var i = 0; i < list.length; i++) {
            var one = list[i];
            var m = one.v;
            var mm = m && m.$mm;
            if (mm) {
                var tName = mm.meta.name;
                if (tName == name) {
                    modelsCache.del(mm.cacheKey);
                }
            }
        }
    },
    /**
     * 获取model的url
     * @param  {String|Object} name model元信息名称
     * @return {String}
     */
    getModelUrl: function(name) {
        var me = this;
        var meta = me.getModelMeta(name);
        if (meta.url) {
            return meta.url;
        } else {
            return me.$mClass.prototype.url(meta.uri);
        }
    },
    /**
     * 监听某个model的before
     * @param  {String}   name     注册时元信息中的名称
     * @param  {Function} callback 回调
     */
    listenBefore: function(name, callback) {
        Event.on.call(this, name + BEFORE, callback);
    },
    /**
     * 监听某个model的after
     * @param  {String}   name     注册时元信息中的名称
     * @param  {Function} callback 回调
     */
    listenAfter: function(name, callback) {
        Event.on.call(this, name + AFTER, callback);
    },
    /**
     * 取消before监听
     * @param  {String}   name     注册时元信息的名称
     * @param  {Function} [callback] 回调
     */
    unlistenBefore: function(name, callback) {
        Event.un.call(this, name + BEFORE, callback);
    },
    /**
     * 取消after监听
     * @param  {String}   name     注册时元信息的名称
     * @param  {Function} [callback] 回调
     */
    unlistenAfter: function(name, callback) {
        Event.un.call(this, name + AFTER, callback);
    },
    /**
     * 触发某个model的before监听
     * @param  {String} name 注册时元信息中的名称
     * @param  {Object} [args] 数据
     */
    fireBefore: function(name, args) {
        Event.fire.call(this, name + BEFORE, args);
    },
    /**
     * 触发某个model的after监听
     * @param  {String} name 注册时元信息中的名称
     * @param  {Object} [args] 数据
     */
    fireAfter: function(name, args) {
        Event.fire.call(this, name + AFTER, args);
    },
    /**
     * 从缓存中获取model对象
     * @param  {String|Object} modelAttrs
     * @return {Model}
     */
    getCachedModel: function(modelAttrs) {
        var me = this;
        var modelsCache = me.$mCache;
        var entity = null;
        var cacheKey;
        var meta;
        if (Magix.isString(modelAttrs)) {
            cacheKey = modelAttrs;
        } else {
            meta = me.getModelMeta(modelAttrs);
            cacheKey = modelAttrs.cacheKey || meta.cacheKey;
            if (Magix.isFunction(cacheKey)) {
                cacheKey = SafeExec(cacheKey, [meta, modelAttrs]);
            }
        }

        if (cacheKey) {
            var requestCacheKeys = me.$mCacheKeys;
            var info = requestCacheKeys[cacheKey];
            if (info) {
                entity = info.e;
            } else if (entity = modelsCache.get(cacheKey)) { //缓存
                if (!meta) meta = entity.$mm.meta;
                var cacheTime = modelAttrs.cacheTime || meta.cacheTime || 0;

                if (Magix.isFunction(cacheTime)) {
                    cacheTime = SafeExec(cacheTime, [meta, modelAttrs]);
                }

                if (cacheTime > 0) {
                    if (Now() - entity.$mm.doneAt > cacheTime) {
                        me.clearCacheByKey(cacheKey);
                        entity = null;
                    }
                }
            }
        }
        return entity;
    }
});
    return MManager;
}, {
    requires: ["magix/magix", "magix/event"]
});