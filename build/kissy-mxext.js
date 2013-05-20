/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.0
 **/
KISSY.add("mxext/mmanager",function(S,Magix){
    var HAS=Magix.has;
    var safeExec=Magix.safeExec;
    var deleteCacheKey=function(models){
        if(!Magix.isArray(models)){
            models=[models];
        }
        for(var i=0,m;i<models.length;i++){
            m=models[i];
            delete m.cacheKey;
        }
        return models;
    };
    /**
     * Model管理对象，可方便的对Model进行缓存和更新
     * @name MManager
     * @class
     * @namespace
     * @param {Model} modelClass Model类
     */
    var MManager=function(modelClass){
        var me=this;
        me.$modelClass=modelClass;
        me.$modelsCache=Magix.createCache();
        me.$modelsCacheKeys={};
    };

    var Slice=[].slice;
    var WhiteList={
        urlParams:1,
        postParams:1,
        cacheKey:1,
        cacheTime:1,
        before:1,
        after:1
    };
    var getOptions=function(obj){
        var r={};
        for(var p in obj){
            if(!WhiteList[p]){
                r[p]=obj[p];
            }
        }
        return r;
    };
    var wrapDone=function(fn,context){
        var a = Slice.call(arguments, 2);
        return function(){
            return fn.apply(context,a.concat(Slice.call(arguments)));
        }
    };
    Magix.mix(MManager,{
        /**
         * @lends MManager
         */
        /**
         * 创建Model类管理对象
         * @param {Model} modelClass Model类
         */
        create:function(modelClass){
            var me=this;
            if(!modelClass){
                throw new Error('MManager.create modelClass ungiven');
            }
            return new MManager(modelClass);
        }
    });
    var FetchFlags={
        ALL:1,
        ONE:2,
        ORDER:4
    };
    /**
     * model请求类
     * @name MRequest
     * @class
     * @namespace
     * @param {MManager} host
     */
    var MRequest=function(host){
        this.$host=host;
        this.$task=false;
    };

    Magix.mix(MRequest.prototype,{
        /**
         * @lends MRequest#
         */
        /**
         * 获取models，该用缓存的用缓存，该发起请求的请求
         * @private
         * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2},params:[]}
         * @param {Function} done   完成时的回调
         * @param {Integer} flag   获取哪种类型的models
         * @return {MRequest}
         */
        fetchModels:function(models,done,flag){
            var me=this;
            if(me.$task){
                me.next(function(request){
                    request.fetchModels(models,done,error,flag);
                });
                return me;
            }
            me.$task=true;
            var host=me.$host;
            
            if(!me.$reqModels)me.$reqModels={};

            var modelsCache=host.$modelsCache;
            var modelsCacheKeys=host.$modelsCacheKeys;
            var reqModels=me.$reqModels;

            if(!Magix.isArray(models)){
                models=[models];
            }
            var total=models.length;
            var current=0;
            var errorMsg;
            var hasError;

            var doneArr=new Array(total);
            var doneArgs=[];
            var errorArgs={};
            var orderlyArr=[];

            var doneIsArray=S.isArray(done);
            if(doneIsArray){
                doneArgs=new Array(done.length);
            }
            var doneFn=function(idx,isFail,model,args){
                
                if(me.$destroy)return;//销毁，啥也不做
                current++;
                delete reqModels[model.id];
                var cacheKey=model._cacheKey;
                doneArr[idx]=model;
                if(isFail){
                    hasError=true;
                    errorMsg=args||errorMsg;
                    errorArgs[idx]=args;
                }else{
                    
                    if(cacheKey&&!modelsCache.get(cacheKey)){
                        modelsCache.set(cacheKey,model);
                    }
                    var metaParams=model.metaParams;
                    model._doneAt=S.now();
                    var context=model._context;
                    if(context){//有after
                        safeExec(context.after,[model].concat(metaParams),context);
                    }
                }               

                if(flag==FetchFlags.ONE){//如果是其中一个成功，则每次成功回调一次
                    var m=doneIsArray?done[idx]:done;
                    if(m){
                        doneArgs[idx]=safeExec(m,[model,isFail?{msg:args}:null,hasError?errorArgs:null],me);
                    }
                }else if(flag==FetchFlags.ORDER){
                    //var m=doneIsArray?done[idx]:done;
                    orderlyArr[idx]={m:model,e:isFail,s:args};
                    //
                    for(var i=orderlyArr.i||0,t,d;t=orderlyArr[i];i++){
                        d=doneIsArray?done[i]:done;
                        doneArgs[i]=safeExec(d,[t.m,t.e?{msg:t.s}:null,orderlyArr.e?errorArgs:null,doneArgs],me);
                        if(t.e){
                            errorArgs[i]=t.s;
                            orderlyArr.e=1;
                        }
                    }
                    orderlyArr.i=i;
                }

                if(cacheKey&&HAS(modelsCacheKeys,cacheKey)){
                    var fns=modelsCacheKeys[cacheKey];
                    delete modelsCacheKeys[cacheKey];
                    safeExec(fns,[isFail,model,args],model);
                }

                if(current>=total){
                    errorArgs.msg=errorMsg;
                    var last=hasError?errorArgs:null;
                    if(flag==FetchFlags.ALL){                           
                        doneArr.push(last);
                        doneArgs[0]=safeExec(done,doneArr,me);
                        doneArgs[1]=last;
                    }else{
                        doneArgs.push(last);
                    }
                    me.$ntId=setTimeout(function(){//前面的任务可能从缓存中来，执行很快
                        me.$task=false;
                        
                        me.doNext(doneArgs);
                    },30);
                }             
            };
            //
            
            for(var i=0,model;i<models.length;i++){
                model=models[i];
                if(model){
                    var modelEntity,modelInfo;
                    var modelInfo=host.getModel(model);
                    var cacheKey=modelInfo.cacheKey;
                    
                    if(cacheKey&&HAS(modelsCacheKeys,cacheKey)){
                        modelsCacheKeys[cacheKey].push(wrapDone(doneFn,me,i));
                    }else{                        
                        modelEntity=modelInfo.entity;
                        if(modelInfo.needUpdate){
                            reqModels[modelEntity.id]=modelEntity;
                            if(cacheKey){
                                modelsCacheKeys[cacheKey]=[];
                            }
                            modelEntity.request({
                                success:wrapDone(doneFn,modelEntity,i,false,modelEntity),
                                error:wrapDone(doneFn,modelEntity,i,true,modelEntity)
                            });
                        }else{
                            doneFn(i,false,modelEntity);
                        }
                    }
                }else{
                    throw new Error('miss attrs:'+models);
                }
            }
            return me;
        },
        /**
         * 获取models，所有请求完成回调done
         * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} done   完成时的回调
         * @return {MRequest}
         */
        fetchAll:function(models,done){
            return this.fetchModels(models,done,FetchFlags.ALL);
        },
        /**
         * 保存models，所有请求完成回调done
         * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} done   完成时的回调
         * @return {MRequest}
         */
        saveAll:function(models,done){
            models=deleteCacheKey(models);
            return this.fetchModels(models,done,FetchFlags.ALL);
        },
        /**
         * 获取models，按顺序执行回调done
         * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} done   完成时的回调
         * @return {MRequest}
         */
        fetchOrder:function(models,done){
            var cbs=Slice.call(arguments,1);
            return this.fetchModels(models,cbs.length>1?cbs:done,FetchFlags.ORDER);
        },
        /**
         * 保存models，按顺序执行回调done
         * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} done   完成时的回调
         * @return {MRequest}
         */
        saveOrder:function(models,done){
            models=deleteCacheKey(models);
            var cbs=Slice.call(arguments,1);
            return this.fetchModels(models,cbs.length>1?cbs:done,FetchFlags.ORDER);
        },
        /**
         * 保存models，其中任意一个成功均立即回调，回调会被调用多次
         * @param {String|Array} models 保存models时的描述信息，如:{name:'Home',urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} callback   完成时的回调
         * @param {Model} callback@model 回调时传入的model对象
         * @param {Object} callback@error 错误对象
         * @return {MRequest}
         */
        saveOne:function(models,callback){
            models=deleteCacheKey(models);
            var cbs=Slice.call(arguments,1);
            return this.reqModels(models,cbs.length>1?cbs:callback,FetchFlags.ONE);
        },
        /**
         * 获取models，其中任意一个成功均立即回调，回调会被调用多次
         * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} callback   完成时的回调
         * @param {Model} callback@model 回调时传入的model对象
         * @param {Object} callback@error 错误对象
         * @return {MRequest}
         */
        fetchOne:function(models,callback){
            var cbs=Slice.call(arguments,1);
            return this.fetchModels(models,cbs.length>1?cbs:callback,FetchFlags.ONE);
        },
        /**
         * 中止所有model的请求
         * 注意：调用该方法后会中止请求，并回调error方法
         */
        abort:function(){
            var me=this;
            clearTimeout(me.$ntId);
            var host=me.$host;
            var reqModels=me.$reqModels;
            var modelsCacheKeys=host.$modelsCacheKeys;

            if(reqModels){
                for(var p in reqModels){
                    var m=reqModels[p];
                    var cacheKey=m._cacheKey;
                    if(cacheKey&&HAS(modelsCacheKeys,cacheKey)){
                        var fns=modelsCacheKeys[cacheKey];
                        delete modelsCacheKeys[cacheKey];
                        safeExec(fns,[true,m,'aborted'],m);
                    }
                    m.abort();
                }
            }
            me.$reqModels={};
            me.$queue=[];
            me.$task=false;
        },
        /**
         * 前一个fetchX或saveX任务做完后的下一个任务
         * @param  {Function} fn 回调
         * @param {MRequest} fn@request MRequest对象，用于发起下一个请求
         * @param {Object} fn@preArgs 前一个任务成功或失败回调的返回值
         * @param {Object} fn@preError 前一个任务执行后是否有错误
         * @return {MRequest}
         */
        next:function(fn){
            var me=this;
            if(!me.$queue)me.$queue=[];
            me.$queue.push(fn);
            if(!me.$task){
                var args=me.$latest||[];
                me.doNext.apply(me,[me].concat(args));
            }
            return me;
        },
        /**
         * 做下一个任务
         * @private
         */
        doNext:function(preArgs){
            var me=this;
            var queue=me.$queue;
            if(queue){
                var one=queue.shift();
                if(one){
                    
                    safeExec(one,[me].concat(preArgs),me);
                }
            }
            me.$latest=preArgs;
        },
        /**
         * 销毁当前请求，与abort的区别是：abort后还可以继续发起新请求，而destroy后则不可以，而且不再回调相应的error方法
         */
        destroy:function(){
            var me=this;
            me.$destroy=true;
            me.abort();
        }
    });

    Magix.mix(MManager.prototype,{
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
         * @param {Function} models.after model在发起请求，并且通过Model.sync调用doneess后的回调
         * @example
         * KISSY.add("app/base/mmanager",function(S,MManager,Model){
                var MM=MManager.create(Model);
                MM.registerModels([
                    {
                        name:'Home_List',
                        options:{
                            uri:'test'
                        },
                        urlParams:{
                            a:'12'
                        },
                        cacheKey:'',
                        cacheTime:20000,//缓存多久
                        before:function(m){
                            
                        },
                        after:function(m){
                            
                        }
                    },
                    {
                        name:'Home_List1',
                        options:{
                            uri:'test'
                        },
                        before:function(m){
                            
                        },
                        after:function(m){
                            
                        }
                    }
                ]);
                return MM;
            },{
                requires:["mxext/mmanager","app/base/model"]
            });

            //使用

            KISSY.use('app/base/mmanager',function(S,MM){
                MM.fetchAll([
                    {name:'Home_List',cacheKey:'aaa',urlParams:{e:'f'}},
                    {name:'Home_List1',urlParams:{a:'b'}}
                ],function(m1,m2){
    
                },function(msg){
    
                });
            });
         */
        registerModels:function(models){
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
            var me=this;
            if(!Magix.isArray(models)){
                models=[models];
            }
            for(var i=0,model;i<models.length;i++){
                model=models[i];
                if(!model.name){
                    throw new Error('model must own a name attribute');
                }
                me[model.name]=model;
            }
        },
        /**
         * 注册方法，前面是参数，后面2个是成功和失败的回调
         * @param {Object} methods 方法对象
         */
        registerMethods:function(methods){
            var me=this;
            for(var p in methods){
                if(HAS(methods,p)){
                    me[p]=(function(fn){
                        return function(){
                            var aborted;
                            var args=arguments;
                            var arr=[];
                            for(var i=0,a;i<args.length;i++){
                                a=args[i];
                                if(Magix.isFunction(a)){
                                    arr.push((function(f){
                                        return function(){
                                            if(aborted)return;
                                            f.apply(f,arguments);
                                        }
                                    }(a)));
                                }else{
                                    arr.push(a);
                                }
                            }
                            var result=fn.apply(me,arr);
                            return {
                                abort:function(){
                                    if(result&&result.abort){
                                        safeExec(result.abort,['aborted'],result);
                                    }
                                    aborted=true;
                                }
                            }
                        }
                    }(methods[p]));
                }
            }
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
        createModel:function(modelAttrs){
            var me=this;
            var meta=me.getModelMeta(modelAttrs);            

            var entity=new me.$modelClass(getOptions(meta));
            var context=modelAttrs;
            if(!context.after){
                context=meta;
            }
            if(context.after){
                entity._context=context;
            }
            var cacheKey=modelAttrs.cacheKey||meta.cacheKey;

            entity._cacheKey=cacheKey;
            entity._meta=meta;
            entity.set(getOptions(modelAttrs));
            //默认设置的
            entity.setUrlParams(meta.urlParams);
            entity.setPostParams(meta.postParams);

            //临时传递的
            entity.setUrlParams(modelAttrs.urlParams);
            entity.setPostParams(modelAttrs.postParams);
            var context=modelAttrs;
            if(!context.before){
                context=meta;
            }
            var metaParams=modelAttrs.metaParams||[];

            if(S.isFunction(context.before)){
                safeExec(context.before,[entity].concat(metaParams),context);
            }
            entity.metaParams=metaParams;
            return entity;
        },
        /**
         * 获取model注册时的元信息
         * @param  {String|Object} modelAttrs 名称
         * @return {Object}
         * @throws {Error} If unfound:name
         */
        getModelMeta:function(modelAttrs){
            var me=this;
            var meta=me[modelAttrs.name];
            if(!meta){
                
                throw new Error('Not found:'+modelAttrs.name);
            }
            return meta;
        },
        /**
         * 获取model对象，优先从缓存中获取
         * @param {Object} modelAttrs           model描述信息对象
         * @return {Object}
         */
        getModel:function(modelAttrs){
            var me=this;
            var entity=me.getModelFromCache(modelAttrs);            
            var needUpdate;
            if(!entity){
                needUpdate=true;
                entity=me.createModel(modelAttrs);
            }
            return {
                entity:entity,
                cacheKey:entity._cacheKey,
                needUpdate:needUpdate
            }
        },
        /**
         * 保存models，所有请求完成回调done
         * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} done   完成时的回调
         * @return {MRequest}
         */
        saveAll:function(models,done){
            return new MRequest(this).saveAll(models,done);
        },
        /**
         * 获取models，所有请求完成回调done
         * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} done   完成时的回调
         * @return {MRequest}
         */
        fetchAll:function(models,done){
            return new MRequest(this).fetchAll(models,done);
        },
        /**
         * 保存models，按顺序回回调done
         * @param {String|Array} models 保存models时的描述信息，如:{name:'Home'urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} done   完成时的回调
         * @return {MRequest}
         */
        saveOrder:function(models,done){
            var mr=new MRequest(this);
            return mr.saveOrder.apply(mr,arguments);
        },
        /**
         * 获取models，按顺序回回调done
         * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} done   完成时的回调
         * @return {MRequest}
         */
        fetchOrder:function(models,done){
            var mr=new MRequest(this);
            return mr.fetchOrder.apply(mr,arguments);
        },
        /**
         * 保存models，其中任意一个成功均立即回调，回调会被调用多次
         * @param {String|Array} models 保存models时的描述信息，如:{name:'Home',urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} callback   完成时的回调
         * @param {Model} callback@model 回调时传入的model对象
         * @param {Object} callback@error 错误对象
         * @return {MRequest}
         */
        saveOne:function(models,callback){
            var mr=new MRequest(this);
            return mr.saveOne.apply(mr,arguments);
        },
        /**
         * 获取models，其中任意一个成功均立即回调，回调会被调用多次
         * @param {String|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},postParams:{b:2}}
         * @param {Function} callback   完成时的回调
         * @param {Model} callback@model 回调时传入的model对象
         * @param {Object} callback@error 错误对象
         * @return {MRequest}
         */
        fetchOne:function(models,callback){
            var mr=new MRequest(this);
            return mr.fetchOne.apply(mr,arguments);
        },
        /**
         * 根据key清除缓存的models
         * @param  {String} key 字符串
         */
        clearCacheByKey:function(key){
            var me=this;
            var modelsCache=me.$modelsCache;
            if(S.isString(key)){
                modelsCache.del(key);
            }
        },
        /**
         * 根据name清除缓存的models
         * @param  {String} name 字符串
         */
        clearCacheByName:function(name){
            var me=this;
            var modelsCache=me.$modelsCache;
            var test;
            var list=modelsCache.c;
            for(var i=0;i<list.length;i++){
                var one=list[i];
                if(one.v&&one.v._meta.name==name){
                    delete list[one.k];
                }
            }
        },
        /**
         * 获取model的url
         * @param  {String|Object} name model元信息名称
         * @return {String}
         */
        getModelUrl:function(name){
            var me=this;
            var meta;
            if(S.isString(name)){
                meta=me[name];
            }else{
                meta=name;
            }
            return me.$modelClass.prototype.url(meta.uri);
        },
        /**
         * 从缓存中获取model对象
         * @param  {String|Object} modelAttrs
         * @return {Model}
         */
        getModelFromCache:function(modelAttrs){
            var me=this;
            var modelsCache=me.$modelsCache;
            var entity=null;
            var cacheKey;
            if(S.isString(modelAttrs)){
                cacheKey=modelAttrs;
            }else{
                var meta=me.getModelMeta(modelAttrs);
                cacheKey=modelAttrs.cacheKey||meta.cacheKey;
            }
            if(cacheKey&&(entity=modelsCache.get(cacheKey))){//缓存
                
                if(!meta)meta=entity._meta;

                var cacheTime=modelAttrs.cacheTime||meta.cacheTime||0;

                if(cacheTime>0){
                    if(S.now()-entity._doneAt>cacheTime){
                        me.clearCacheByKey(cacheKey);
                        entity=null;
                    }
                }
            }
            return entity;
        }
    });
    return MManager;
},{
    requires:["magix/magix"]
});/**
 * @fileOverview Model
 * @version 1.0
 * @author 行列
 */
KISSY.add("mxext/model",function(S,Magix){
    /**
     * Model类
     * @name Model
     * @namespace
     * @class
     * @constructor
     * @param {Object} ops 初始化Model时传递的其它参数对象
     * @property {String} uri 与后台接口对应的前端url key
     * @example
     * 项目中对Model的引用及配置：
     * KISSY.add("app/base/model",function(S,Model,io){
            return Model.extend(
                urlMap:{
                    'modules':{
                        'get':'/modules.jsp?action=get',
                        'set':'/modules.jsp?action=set'
                    }
                },
                parse:function(resp){
                    return resp;//可对返回的结果在这地方进行简单的处理
                },
                sync:function(model,ops){
                    var url=model.url();
                    var isJSONP=model.get('isJSONP');
                    return io({
                        url:url,
                        success:function(resp){
                            ops.success(resp);
                        }
                    });
                }
            });
        },{
            requires:["mxext/model","ajax"]
        });

        在view中的具体使用：

        render:function(){
            var m=new Model({
                uri:'modules:get'
            });
            m.load({
                success:function(data){
                    //TODO
                },
                error:function(msg){
                    //TODO
                }
            })
        }
     */
    var processObject=function(props,proto,enterObject){
        for(var p in proto){
            if(S.isObject(proto[p])){
                if(!Magix.has(props,p))props[p]={};
                processObject(props[p],proto[p],true);
            }else if(enterObject){
                props[p]=proto[p];
            }
        }
    };
    var Model=function(ops){
        if(ops){
            this.set(ops);
        }
        this.id=S.guid('m');
    };
    var ex=function(props,ctor){
        var BaseModel=function(){
            BaseModel.superclass.constructor.apply(this,arguments);
            if(ctor){
                Magix.safeExec(ctor,[],this);
            }
        }
        Magix.mix(BaseModel,this,{prototype:true});
        processObject(props,this.prototype);
        return S.extend(BaseModel,this,props);
    };
    Magix.mix(Model,{
        /**
         * @lends Model
         */
        /**
         * GET枚举
         * @type {String}
         */
        GET:'GET',
        /**
         * POST枚举
         * @type {String}
         */
        POST:'POST',
        /**
         * 继承
         * @function
         * @param {Object} props 方法对象
         * @param {Function} ctor 继承类的构造方法
         */
        extend:ex
    });


    Magix.mix(Model.prototype,{
        /**
         * @lends Model#
         */
        /**
         * url映射对象
         * @type {Object}
         */
        urlMap:{

        },
        /**
         * Model调用save或load方法后，与服务器同步的方法，供应用开发人员覆盖
         * @function
         * @param {Model} model model对象
         * @param {Object} ops 包含success error的参数信息对象
         * @return {XHR} 最好返回异步请求的对象
         */
        sync:Magix.noop,
        /**
         * 处理Model.sync成功后返回的数据
         * @function
         * @param {Object|String} resp 返回的数据
         * @return {Object}
         */
        parse:function(r){
            return r;
        },
        /**
         * 获取参数对象
         * @param  {String} [type] 参数分组的key[Model.GET,Model.POST]，默认为Model.GET
         * @return {Object}
         */
        getParamsObject:function(type){
            if(!type)type=Model.GET;
            return this['$'+type]||null;
        },
        /**
         * 获取参数对象
         * @return {Object}
         */
        getUrlParamsObject:function(){
            return this.getParamsObject(Model.GET);
        },
        /**
         * 获取Post参数对象
         * @return {Object}
         */
        getPostParamsObject:function(){
            return this.getParamsObject(Model.POST);
        },
        /**
         * 获取通过setPostParams放入的参数
         * @return {String}
         */
        getPostParams:function () {
            return this.getParams(Model.POST);
        },
        /**
         * 获取通过setUrlParams放入的参数
         * @return {String}
         */
        getUrlParams:function(){
            return this.getParams(Model.GET);
        },
        /**
         * 获取参数
         * @param {String} [type] 参数分组的key[Model.GET,Model.POST]，默认为Model.GET
         * @return {String}
         */
        getParams:function (type) {
            var me=this;
            if(!type){
                type=Model.GET;
            }else{
                type=type.toUpperCase();
            }
            var k='$'+type;
            var params=me[k];
            var arr=[];
            var v;
            if (params) {
                for (var p in params) {
                    v = params[p];
                    if (S.isArray(v)) {
                        for (var i = 0; i < v.length; i++) {
                            arr.push(p + '=' + encodeURIComponent(v[i]));
                        }
                    } else {
                        arr.push(p + '=' + encodeURIComponent(v));
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
        setUrlParamsIf:function (obj1, obj2) {
            this.setParams(obj1, obj2, Model.GET,true);
        },
        /**
         * 设置post参数，只有未设置过的参数才进行设置
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         */
        setPostParamsIf:function(obj1,obj2){
            var me=this;
            me.setParams(obj1,obj2,Model.POST,true);
        },
        /**
         * 设置参数
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         * @param {String}   type      参数分组的key
         * @param {Boolean}   ignoreIfExist   如果存在同名的参数则不覆盖，忽略掉这次传递的参数
         * @param {Function} callback 对每一项参数设置时的回调
         */
        setParams:function (obj1,obj2,type,ignoreIfExist) {
            if(!type){
                type=Model.GET;
            }else{
                type=type.toUpperCase();
            }
            var me=this;
            if(!me.$keysCache)me.$keysCache={};
            me.$keysCache[type]=true;

            var k = '$' + type;
            if (!me[k])me[k] = {};
            if (S.isObject(obj1)) {
                for (var p in obj1) {
                    if (!ignoreIfExist || !me[k][p]) {
                        me[k][p] = obj1[p];
                    }
                }
            } else if(obj1){
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
        setPostParams:function (obj1, obj2) {
            var me = this;
            me.setParams(obj1, obj2,Model.POST);
        },
        /**
         * 设置url参数
         * @param {Object|String} obj1 参数对象或者参数key
         * @param {String} [obj2] 参数内容
         */
        setUrlParams:function(obj1,obj2){
            this.setParams(obj1,obj2,Model.GET);
        },
        /**
         * @private
         */
        removeParamsObject:function(type){
            if(!type)type=Model.GET;
            delete this['$'+type];
        },
        /**
         * @private
         */
        removePostParamsObject:function(){
            this.removeParamsObject(Model.POST);
        },
        /**
         * @private
         */
        removeUrlParamsObject:function(){
            this.removeParamsObject(Model.GET);
        },
        /**
         * 重置缓存的参数对象，对于同一个model反复使用前，最好能reset一下，防止把上次请求的参数也带上
         */
        reset:function () {
            var me=this;
            var keysCache=me.$keysCache;
            if(keysCache){
                for(var p in keysCache){
                    if(Magix.has(keysCache,p)){
                        delete me['$'+p];
                    }
                }
                delete me.$keysCache;
            }
            var keys=me.$keys;
            var attrs=me.$attrs;
            if(keys){
                for(var i=0;i<keys.length;i++){
                    delete attrs[keys[i]];
                }
                delete me.$keys;
            }
        },
        /**
         * 获取model对象请求时的后台地址
         * @return {String}
         */
        url:function (url) {
            var self = this,
                uri = url||self.get('uri'),
                uris;
            if (uri) {
                uris = uri.split(':');
                var maps=self.urlMap;
                if(maps){
                    for (var i = 0, parent = maps,j=uris.length; i < j; i++) {
                        parent = parent[uris[i]];
                        if (parent === undefined) {
                            break;
                        } else if (i == j - 1) {
                            uri=parent;
                        }
                    }
                }
            }else{
                
                throw new Error('model not set uri');
            }
            return uri;
        },
        /**
         * 获取属性
         * @param {String} type type
         * @return {Object}
         */
        get:function(type){
            var me=this;
            var attrs=me.$attrs;
            if(attrs){
                return attrs[type];
            }
            return null;
        },
        /**
         * 设置属性
         * @param {String|Object} key 属性对象或属性key
         * @param {Object} [val] 属性值
         */
        set:function(key,val,saveKeyList){
            var me=this;
            if(!me.$attrs)me.$attrs={};
            if(saveKeyList&&!me.$keys){
                me.$keys=[];
            }
            if(S.isObject(key)){
                for(var p in key){
                    if(saveKeyList){
                        me.$keys.push(p);
                    }
                    me.$attrs[p]=key[p];
                }
            }else if(key){
                if(saveKeyList){
                    me.$keys.push(key);
                }
                me.$attrs[key]=val;
            }
        },
        /**
         * 加载model数据
         * @param {Object} ops 请求选项
         */
        load:function(ops){
            this.request(ops);
        },
        /**
         * 保存model数据
         * @param {Object} ops 请求选项
         */
        save:function(ops){
            this.request(ops);
        },
        /**
         * 向服务器请求，加载或保存数据
         * @param {Object} ops 请求选项
         * @param {Function} ops.success 成功后的回调
         * @param {Function} ops.error 失败后的回调
         */
        request:function(ops){
            if(!ops)ops={};
            var success=ops.success;
            var error=ops.error;
            var me=this;
            me.$abort=false;
            ops.success=function(resp){
                if(!me.$abort){
                    if(resp){
                        var val=me.parse(resp);
                        if(val){
                            if(S.isArray(val)){
                                val={
                                    list:val
                                };
                            }
                            me.set(val,null,true);
                        }
                    }
                    if(success){
                        success.apply(this,arguments);
                    }
                }
            };
            ops.error=function(){
                if(!me.$abort){
                    if(error)error.apply(this,arguments);
                }
            };
            me.$trans=me.sync(ops);
        },
        /**
         * 中止请求
         */
        abort:function(){
            var me=this;
            if(me.$trans&&me.$trans.abort){
                me.$trans.abort();
            }
            delete me.$trans;
            me.$abort=true;
        },
        /**
         * 获取当前model是否已经取消了请求
         * @return {Boolean}
         */
        isAborted:function(){
            return this.$abort;
        },
        /**
         * 开始事务
         * @example
         * //...
         * var userList=m.get('userList');//从model中取出userList数据
         * m.beginTransaction();//开始更改的事务
         * userList.push({userId:'58782',userName:'xinglie.lkf'});//添加一个新用户
         * m.save({
         *     //...
         *     success:function(){
         *           m.endTransaction();//成功后通知model结束事务  
         *     },
         *     error:function(){
         *         m.rollbackTransaction();//出错，回滚到原始数据状态
         *     }
         * });
         * //应用场景：
         * //前端获取用户列表，添加，删除或修改用户后
         * //把新的数据提交到数据库，因model是数据的载体
         * //可能会直接在model原有的数据上修改，提交修改后的数据
         * //如果前端提交到服务器，发生失败时，需要把
         * //model中的数据还原到修改前的状态(当然也可以再次提交)
         * //
         * //注意：
         * //可能添加，删除不太容易应用这个方法，修改没问题
         * //
         */
        beginTransaction:function(){
            var me=this;
            me.$bakAttrs=S.clone(me.$attrs);
        },
        /**
         * 回滚对model数据做的更改
         */
        rollbackTransaction:function(){
            var me=this;
            var bakAttrs=me.$bakAttrs;
            if(bakAttrs){
                me.$attrs=bakAttrs;
                delete me.$bakAttrs;
            }
        },
        /**
         * 结束事务
         */
        endTransaction:function(){
            delete this.$bakAttrs;
        }
    });
    return Model;
},{
    requires:["magix/magix"]
});/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.0
 **/
KISSY.add("mxext/modelfactory",function(S,Magix){
    /**
     * 工厂类，可方便的对Model进行缓存和更新
     * @name ModelFactory
     * @class
     * @namespace
     * @param {Model} modelClass Model类
     */
    var Factory=function(modelClass){
        var me=this;
        me.$modelClass=modelClass;
    };
    var UpdateIdent='~~ui';
    var WrapRequest=function(request){
        if(request._wraped_)return request;
        var req=function(ops){
            var bakSucc=ops.success;
            var model=this;
            var updateIdent=model.get(UpdateIdent);
            if(updateIdent){//有更新
                ops.success=function(){
                    
                    model.set(UpdateIdent,false);
                    if(model._after){
                        Magix.safeExec(model._after,model);
                    }
                    if(bakSucc){
                        bakSucc.apply(ops);
                    }
                }
                request.call(model,ops);
            }else{
                if(bakSucc){
                    bakSucc.apply(ops);
                }
            }
        }
        req._wraped_=true;
        return req;
    };
    Magix.mix(Factory,{
        /**
         * @lends ModelFactory
         */
        /**
         * Model类缓存对象
         * @type {Object}
         */
        mClsCache:{},
        /**
         * 创建Model类工厂对象
         * @param {String} key        标识key
         * @param {Model} modelClass Model类
         */
        create:function(key,modelClass){
            var me=this;
            if(!modelClass){
                throw new Error('Factory.create modelClass ungiven');
            }
            var cache=me.mClsCache;
            if(!key)key=S.guid();
            if(!cache[key]){
                cache[key]=new Factory(modelClass);
            }
            return cache[key];
        }
    });
    var FetchFlags={
        ALL:1,
        ANY:2,
        ONE:4
    };
    Magix.mix(Factory.prototype,{
        /**
         * @lends ModelFactory#
         */
        /**
         * 注册APP中用到的model
         * @param {Object|Array} models 模块描述信息
         * @param {String} models.type app中model的唯一标识
         * @param {Object} models.ops 传递的参数信息，如{uri:'test',isJSONP:true,updateIdent:true}
         * @param {Object} models.gets 发起请求时，默认的get参数对象
         * @param {Object} models.posts 发起请求时，默认的post参数对象
         * @param {String} models.cacheKey 指定model缓存的key，当指定后，该model会进行缓存，下次不再发起请求，可使用该key通过getIf方法获取缓存的这个model
         * @param {Integer} models.expires 缓存过期时间，以毫秒为单位，当过期后，再次使用该model时会发起新的请求(前提是该model指定cacheKey被缓存后expires才有效)
         * @param {Function} models.before model在发起请求前的回调
         * @param {Function} models.after model在发起请求，并且通过Model.sync调用success后的回调
         * @example
         * KISSY.add("app/base/mfactory",function(S,MFctory,Model){
                var MF=MFctory.create('test/mf',Model);
                MF.registerModels([
                    {
                        type:'Home_List',
                        ops:{
                            uri:'test'
                        },
                        gets:{
                            a:'12'
                        },
                        cacheKey:'',
                        expires:20000,//缓存多久
                        before:function(m){
                            
                        },
                        after:function(m){
                            
                        }
                    },
                    {
                        type:'Home_List1',
                        ops:{
                            uri:'test'
                        },
                        before:function(m){
                            
                        },
                        after:function(m){
                            
                        }
                    }
                ]);
                return MF;
            },{
                requires:["mxext/modelfactory","app/base/model"]
            });

            //使用

            KISSY.use('app/base/mfactory',function(S,MF){
                MF.fetchAll([{
                    type:MF.Home_List,cacheKey:'aaa',gets:{e:'f'},
                    type:MF.Home_List1,gets:{a:'b'}
                }],function(m1,m2){
    
                },function(msg){
    
                });
            });
         */
        registerModels:function(models){
            /*
                type:'',
                ops:{
                    uri:'',
                    isJSONP:'',
                    updateIdent:false
                },
                gets:'',
                posts:'',
                expires:20000,//缓存多久
                before:function(m){
    
                },
                after:function(m){
                    
                }
             */
            var me=this;
            if(!Magix.isArray(models)){
                models=[models];
            }
            for(var i=0,model;i<models.length;i++){
                model=models[i];
                if(!model.type){
                    throw new Error('model must own a type attribute');
                }
                me[model.type]=model;
            }
        },
        /**
         * 注册方法，前面是参数，后面2个是成功和失败的回调
         * @param {Object} methods 方法对象
         */
        registerMethods:function(methods){
            var me=this;
            for(var p in methods){
                if(Magix.hasProp(methods,p)){
                    me[p]=methods[p];
                }
            }
        },
        /**
         * 调用多个方法
         * @param {Array} args 要调用的方法列表，形如：[{name:'x',params:['o']},{name:'y',params:['z']}]
         * @param {Function} succ 成功时的回调，传入参数跟args数组中对应的成功方法的返回值
         * @param {Function} fail 失败回调，参数同上
         * @return {Object} 返回一个带abort方法的对象，用于取消这些方法的调用
         */
        callMethods:function(args,succ,fail){
            var me=this,
                succArgs=[],
                failMsg='',
                total=args.length,
                exec= 0,
                aborted,
                doneCheck=function(args,idx,isFail){
                    if(aborted)return;
                    exec++;
                    if(isFail){
                        failMsg=args;
                    }else{
                         succArgs[idx]=args;
                    }
                    if(total<=exec){
                        if(!failMsg){
                            if(S.isFunction(succ)){
                                succ.apply(succ,succArgs);
                            }
                        }else{
                            if(S.isFunction(fail)){
                                fail(failMsg);
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
        },
        /**
         * 获取models，该用缓存的用缓存，该发起请求的请求
         * @see ModelFactory#registerModels
         * @param {Object|Array} models 获取models时的描述信息，如:{type:F.Home,cacheKey:'key',gets:{a:'12'},posts:{b:2},params:[]}
         * @param {Function} succ   成功时的回调
         * @param {Function} fail   失败时的回调
         * @param {Integer} flag   获取哪种类型的models
         * @return {Object} 返回一个带abort方法的对象，用于取消所有请求的model
         */
        fetchModels:function(models,succ,fail,flag){
            var me=this;
            if(!me.$modelsCache)me.$modelsCache={};
            if(!me.$modelsCacheKeys)me.$modelsCacheKeys={};
            var modelsCache=me.$modelsCache;
            var modelsCacheKeys=me.$modelsCacheKeys;

            if(!Magix.isArray(models)){
                models=[models];
            }
            var total=models.length;
            var current=0;
            var failMsg;

            var doneArr=[];
            var abortArr=[];
            var hasOneSuccess;

            var doneFn=function(idx,isFail,model,args){
                current++;
                if(isFail){
                    failMsg=args||'fetch data error';
                }else{
                    hasOneSuccess=true;
                    model.set(UpdateIdent,false);//成功后标识model不需要更新，防止需要缓存的model下次使用时发起请求
                    
                    
                    doneArr[idx]=model;
                    var cacheKey=model._cacheKey;
                    if(cacheKey&&!Magix.hasProp(modelsCache,cacheKey)){//需要缓存
                        modelsCache[model._cacheKey]=model;
                        var params=model._params;
                        model._doneAt=S.now();
                        if(model._after){//有after
                            Magix.safeExec(model._after,[model].concat(params));
                        }
                    }
                    if(flag==FetchFlags.ONE){//如果是其中一个成功，则每次成功回调一次
                        succ(model);
                    }
                }
                var cacheKey=model._cacheKey;
                if(cacheKey&&Magix.hasProp(modelsCacheKeys,cacheKey)){
                    var fns=modelsCacheKeys[cacheKey];
                    delete modelsCacheKeys[cacheKey];
                    //
                    Magix.safeExec(fns,[isFail,model,args],model);
                    //
                }
                if(flag!=FetchFlags.ONE){
                    //
                    if(current>=total){
                        if(flag==FetchFlags.ANY){//任意一个成功
                            if(hasOneSuccess){
                                if(succ)succ.apply(me,doneArr);
                            }else{
                                if(fail)fail(failMsg);
                            }
                        }else{//所有的都要成功
                            if(!failMsg){
                                if(succ)succ.apply(me,doneArr);
                            }else{
                                if(fail)fail(failMsg);
                            }
                        }
                    }
                }
            };
            //
            var Slice=Array.prototype.slice;
            var wrapDone=function(fn,context){
                var a = Slice.call(arguments, 2);
                return function(){
                    return fn.apply(context,a.concat(Slice.call(arguments)));
                }
            };
            for(var i=0,model;i<models.length;i++){
                model=models[i];

                var cacheKey=model.cacheKey;
                var modelEntity;

                if(cacheKey&&Magix.hasProp(modelsCacheKeys,cacheKey)){
                    modelsCacheKeys[cacheKey].push(wrapDone(doneFn,me,i));
                }else{
                    modelEntity=me.create(model,true);
                    var updateIdent=modelEntity.get(UpdateIdent);//是否需要更新
                    if(updateIdent){
                        abortArr.push(modelEntity);
                        if(cacheKey){
                            modelsCacheKeys[cacheKey]=[];
                        }
                        modelEntity.request({
                            success:wrapDone(doneFn,modelEntity,i,false,modelEntity),
                            error:wrapDone(doneFn,modelEntity,i,true,modelEntity)
                        });
                    }else{
                        doneFn(i,false,modelEntity);
                    }
                }
            }
            return {
                abort:function(){
                    for(var i=0,m;i<abortArr.length;i++){
                        m=abortArr[i];
                        var cacheKey=m._cacheKey;
                        if(cacheKey&&Magix.hasProp(modelsCacheKeys,cacheKey)){
                            var fns=modelsCacheKeys[cacheKey];
                            delete modelsCacheKeys[cacheKey];
                            Magix.safeExec(fns,[true,m,'abort'],m);
                        }
                        m.abort();
                    }
                }
            }
        },
        /**
         * 获取models，所有成功才回调succ，任意一个失败最终会回调fail
         * @param {Object|Array} models 获取models时的描述信息，如:{type:F.Home,cacheKey:'key',gets:{a:'12'},posts:{b:2}}
         * @param {Function} succ   成功时的回调
         * @param {Function} fail   失败时的回调
         * @return {Array} 返回一个带abort方法的对象，用于取消所有请求的model
         */
        fetchAll:function(models,succ,fail){
            /*
                [{type:F.ASide,cacheKey:'',gets:{},posts:{}}]
             */
            return this.fetchModels(models,succ,fail,FetchFlags.ALL);
        },
        /**
         * 获取models，其中任意一个成功最终回调succ，全部失败才回调fail
         * @param {Object|Array} models 获取models时的描述信息，如:{type:F.Home,cacheKey:'key',gets:{a:'12'},posts:{b:2}}
         * @param {Function} succ   成功时的回调
         * @param {Function} fail   失败时的回调
         * @return {Array} 返回一个带abort方法的对象，用于取消所有请求的model
         */
        fetchAny:function(models,succ,fail){
            return this.fetchModels(models,succ,fail,FetchFlags.ANY);
        },
        /**
         * 获取models，其中任意一个成功均立即回调，回调会被调用多次
         * @param {Object|Array} models 获取models时的描述信息，如:{type:F.Home,cacheKey:'key',gets:{a:'12'},posts:{b:2}}
         * @param {Function} callback   成功时的回调
         * @return {Array} 返回一个带abort方法的对象，用于取消所有请求的model
         */
        fetchOne:function(models,callback){
            return this.fetchModels(models,callback,Magix.noop,FetchFlags.ONE);
        },
        /**
         * 尝试获取缓存的model
         * @param {String} cacheKey 缓存时的key
         * @return {Object} null或缓存的model
         */
        getIf:function(cacheKey){
            var me=this;
            var modelsCache=me.$modelsCache;
            if(modelsCache&&Magix.hasProp(modelsCache,cacheKey)){
                return modelsCache[cacheKey];
            }
            return null;
        },
        /**
         * 设置缓存的model需要更新
         * @param {String} cacheKey 缓存时的key
         */
        setUpdateIdent:function(cacheKey){
            var me=this;
            var model=me.getIf(cacheKey);
            if(model){
                model.set(UpdateIdent,true);
            }
        },
        /**
         * 创建model对象
         * @param {Object} model            model描述信息
         * @param {Boolean} doNotWrapRequest 是否不对request进行包装，默认会对model的request进行一次包装，以完成后续的状态更新
         * @return {Model} model对象
         */
        create:function(model,doNotWrapRequest){
            if(!model.type){
                throw new Error('model must own a "type" attribute');
            }
            var me=this;
            var metas=model.type;
            var cacheKey=model.cacheKey||metas.cacheKey;
            var modelEntity;
            
            var expires=model.expires||metas.expires||0;


            if(!me.$modelsCache)me.$modelsCache={};
            var modelsCache=me.$modelsCache;
            var params=model.params||[];

            if(cacheKey&&Magix.hasProp(modelsCache,cacheKey)){//缓存
                
                modelEntity=modelsCache[cacheKey];

                var updateIdent=modelEntity.get(UpdateIdent);
                if(!updateIdent&&expires>0){
                    
                    if(S.now()-modelEntity._doneAt>expires){
                        updateIdent=true;
                    }
                }
                if(updateIdent){//当有更新时，从缓存中删除，防止多次获取该缓存对象导致数据错误
                    delete modelsCache[cacheKey];
                    modelEntity.set(UpdateIdent,true);
                }
            }else{
                
                modelEntity=new me.$modelClass(metas.ops);
                modelEntity._after=metas.after;
                modelEntity._cacheKey=cacheKey;
                modelEntity.set(UpdateIdent,true);
            }
            modelEntity._params=params;

            var updateIdent=modelEntity.get(UpdateIdent);//是否需要更新
            if(updateIdent){
                modelEntity.reset();
                
                modelEntity.set(model.ops);
                //默认设置的
                modelEntity.setParams(metas.gets);
                modelEntity.setPostParams(metas.posts);

                //临时传递的
                modelEntity.setParams(model.gets);
                modelEntity.setPostParams(model.posts);
                
                if(Magix.isFunction(metas.before)){
                    Magix.safeExec(metas.before,[modelEntity].concat(params),metas);
                }
            }
            if(!doNotWrapRequest){
                modelEntity.request=WrapRequest(modelEntity.request);
            }
            return modelEntity;
        }
    });
    return Factory;
},{
    requires:["magix/magix"]
});/**
 * @fileOverview 对magix/view的扩展
 * @version 1.0
 * @author 行列
 */
KISSY.add('mxext/view',function(S,Magix,View,Router,VM){
    var WIN=window;
    var COMMA=',';
    var DestroyManagedTryList='destroy,abort,stop,cancel,remove'.split(COMMA);
    var ResCounter=0;
    var safeExec=Magix.safeExec;
    var HAS=Magix.has;
    var VOMEventsObject={};
    var PrepareVOMMessage=function(vom){
        if(!PrepareVOMMessage.d){
            PrepareVOMMessage.d=1;
            vom.on('add',function(e){
                var vf=e.vframe;
                var list=VOMEventsObject[vf.id];
                if(list){
                    for(var i=0;i<list.length;i++){
                        PostMessage(vf,list[i]);
                    }
                    delete VOMEventsObject[vf.id];
                }
            });
            vom.on('remove',function(e){
                delete VOMEventsObject[e.vframe.id];
            });
            var vf=vom.root();
            vf.on('childrenCreated',function(){
                VOMEventsObject={};
            });
        }
    };
    var PostMessage=function(vframe,args){
        var view=vframe.view;
        if(view&&vframe.viewUsable){
            safeExec(view.receiveMessage,args,view);
        }else{
            var interact=function(e){
                vframe.un('viewInteract',interact);
                safeExec(e.view.receiveMessage,args,e.view);
            };
            vframe.on('viewInteract',interact);
        }
    };
    /**
     * @name MxView
     * @namespace
     * @requires View
     * @augments View
     */
    var MxView=View.extend({
        mxViewCtor:Magix.noop,//供扩展用
        /**
         * 调用magix/router的navigate方法
         * @param {Object|String} params 参数字符串或参数对象
         */
        navigate:function(params){
            Router.navigate.apply(Router,arguments);
        },
        /**
         * 让view帮你管理资源，对于异步回调函数更应该调用该方法进行托管
         * 当调用该方法后，您不需要在异步回调方法内判断当前view是否已经销毁
         * 同时对于view刷新后，上个异步请求返回刷新界面的问题也得到很好的解决。<b>强烈建议对异步回调函数，组件等进行托管</b>
         * @param {String|Object} key 托管的资源或要共享的资源标识key
         * @param {Object} [res] 要托管的资源
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
         *          success:_self.manage(function(resp){//管理匿名函数
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
         *          }),
         *          error:_self.manage(function(msg){
         *              //TODO
         *          })
         *      })
         * }
         */
        manage:function(key,res){
            var me=this;
            var args=arguments;
            var hasKey=true;
            if(args.length==1){
                res=key;
                key='res_'+(ResCounter++);
                hasKey=false;
            }
            if(!me.$resCache)me.$resCache={};
            var wrapObj={
                hasKey:hasKey,
                res:res
            };
            me.$resCache[key]=wrapObj;
            return res;
        },
        /**
         * 获取托管的资源
         * @param {String} key 托管资源时传入的标识key
         * @return {[type]} [description]
         */
        getManaged:function(key){
            var me=this;
            var cache=me.$resCache;
            var sign=me.sign;
            if(cache&&HAS(cache,key)){
                var wrapObj=cache[key];
                var resource=wrapObj.res;
                return resource;
            }
            return null;
        },
        /**
         * 移除托管的资源
         * @param {String|Object} param 托管时标识key或托管的对象
         * @return {Object} 返回移除的资源
         */
        removeManaged:function(param){
            var me=this,res=null;
            var cache=me.$resCache;
            if(cache){
                if(HAS(cache,param)){
                    res=cache[param].res;
                    delete cache[param];
                }else{
                    for(var p in cache){
                        if(cache[p].res===param){
                            res=cache[p].res;
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
         * @param {Boolean} [byRefresh] 是否是刷新时的销毁
         * @private
         */
        destroyManaged:function(byRefresh){
            var me=this;
            var cache=me.$resCache;
            //
            if(cache){
                for(var p in cache){
                    var o=cache[p];
                    //var processed=false;
                    var res=o.res;
                    if(Magix.isNumber(res)){//数字，有可能是定时器
                        WIN.clearTimeout(res);
                        WIN.clearInterval(res);
                        //processed=true;
                    }else if(res){
                        if(res.nodeType&&res.parentNode){
                            S.one(res).remove();
                            //processed=true;
                        }else{
                            for(var i=0;i<DestroyManagedTryList.length;i++){
                                if(Magix.isFunction(res[DestroyManagedTryList[i]])){
                                    safeExec(res[DestroyManagedTryList[i]],[],res);
                                    //processed=true;
                                    //不进行break,比如有时候可能存在abort 和  destroy
                                }
                            }
                        }
                    }
                    /*me.fire('destroyResource',{
                        resource:res,
                        processed:processed
                    });*/
                    if(byRefresh&&!o.hasKey){//如果是刷新且托管时没有给key值，则表示这是一个不会在其它方法内共享托管的资源，view刷新时可以删除掉
                        delete cache[p];
                    }
                }
                if(!byRefresh){//如果不是刷新，则是view的销毁
                    //me.un('destroyResource');
                    delete me.$resCache;
                }
            }
        },
        /**
         * 用于接受其它view通过postMessageTo方法发来的消息，供最终的view开发人员进行覆盖
         * @function
         * @param {Object} e 通过postMessageTo传递的第二个参数
         */
        receiveMessage:Magix.noop,
        /**
         * 向某个vframe发送消息
         * @param {Array|String} aims  目标vframe id数组
         * @param {Object} args 消息对象
         */
        postMessageTo:function(aims,args){
            var vom=this.vom;
            PrepareVOMMessage(vom);

            if(!Magix.isArray(aims)){
                aims=[aims];
            }
            if(!args)args={};
            for(var i=0,it;i<aims.length;i++){
                it=aims[i];
                var vframe=vom.get(it);
                if(vframe){
                    PostMessage(vframe,args);
                }else{
                    if(!VOMEventsObject[it]){
                        VOMEventsObject[it]=[];
                    }
                    VOMEventsObject[it].push(args);
                }
            }
        },
        /**
         * @private
         */
        destroyMRequest:function(){
            var me=this;
            var cache=me.$resCache;
            if(cache){
                for(var p in cache){
                    var o=cache[p];
                    var res=o.res;
                    if(res&&res.fetchOne&&res.fetchAll){//销毁MRequest
                        res.destroy();
                        delete cache[p];
                    }
                }
            }
        }
    },function(){
        var me=this;
        me.on('interact',function(){
            me.on('rendercall',function(){
                me.destroyMRequest();
            });
            me.on('prerender',function(){
                me.destroyManaged(true);
            });
            me.on('destroy',function(){
                me.destroyManaged();
            });
        });
        me.mxViewCtor();
    });
    return MxView;
    /*
        推荐使用的事件，KISSY这块的
        queryEvents:{
            mouseover:{
                '#id':function(){
                    
                },
                '.title':function(){//  S.one('.title').click(); S.one().delegate(); 
                    
                }
            },
            mouseenter:{
                '#id':function(e){
                    
                }
            }
        }
     */
    //return View.extend({
        /*attachQueryEvents:function(){
            var me=this;
            var queryEvents=me.queryEvents;
            if(queryEvents){
                me.$queryEventsCache={};
                for(var p in queryEvents){
                    var evts=queryEvents[p];
                    for(var q in evts){
                        //
                        S.all('#'+me.id+' '+q).on(p,me.$queryEventsCache[p+'_'+q]=(function(fn){
                            return function(e){
                                if(me.enableEvent){
                                    var targetId=View.idIt(e.target);
                                    var currentId=View.idIt(e.currentTarget);
                                    Magix.safeExec(fn,{
                                        view:me,
                                        targetId:targetId,
                                        currentId:currentId,
                                        queryEvents:queryEvents,
                                        domEvent:e
                                    },queryEvents);
                                }
                            }
                        }(evts[q])));
                    }
                }
            }
            //
        },*/
        /**
         * 清除根据选择器添加的事件
         */
        /*detachQueryEvents:function(){
            var me=this;
            var queryEvents=me.queryEvents;
            if(queryEvents){
                for(var p in queryEvents){
                    var evts=queryEvents[p];
                    for(var q in evts){
                        S.all('#'+me.id+' '+q).detach(p,me.$queryEventsCache[p+'_'+q]);
                    }
                }
                delete me.$queryEventsCache;
            }
        },*/
        
        
        /**
        
        
        
    },function(){
        var me=this;
        me.vm = new VM();
        me.on('interact',function(){
            me.on('rendercall',function(){
                me.destroyAsyncall();
            });
            me.on('prerender',function(){
                me.destroyManaged(true);
                me.detachQueryEvents();
            });
            me.on('rendered',function(){
                me.attachQueryEvents();
            });
            me.on('destroy',function(){
                me.destroyManaged();
            });
        });
    });*/


    /**
     * view销毁托管资源时发生
     * @name MxView#destroyResource
     * @event
     * @param {Object} e
     * @param {Object} e.resource 托管的资源
     * @param {Boolean} e.processed 表示view是否对这个资源做过销毁处理，目前view仅对带 abort destroy dispose方法的资源进行自动处理，其它资源需要您响应该事件自已处理
     */
},{
    requires:["magix/magix","magix/view","magix/router"]
});