/**
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
	var WrapRequest=function(request){
		if(request._wraped_)return request;
		var req=function(ops){
			var bakSucc=ops.success;
			var model=this;
			var updateIdent=model.get('updateIdent');
			if(updateIdent){//有更新
				ops.success=function(){
					
					model.set('updateIdent',false);
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
		 * 获取models，该用缓存的用缓存，该发起请求的请求
		 * @see ModelFactory#registerModels
		 * @param {Object|Array} models 获取models时的描述信息，如:{type:F.Home,cacheKey:'key',gets:{a:'12'},posts:{b:2}}
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
					model.set('updateIdent',false);//成功后标识model不需要更新，防止需要缓存的model下次使用时发起请求
					doneArr[idx]=model;
					var cacheKey=model._cacheKey;
					if(cacheKey&&!Magix.hasProp(modelsCache,cacheKey)){//需要缓存
						modelsCache[model._cacheKey]=model;
						if(model._after){//有after
							Magix.safeExec(model._after,model);
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
					var updateIdent=modelEntity.get('updateIdent');//是否需要更新
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
				model.set('updateIdent',true);
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
			
			if(!me.$modelsCache)me.$modelsCache={};
			var modelsCache=me.$modelsCache;

			if(cacheKey&&Magix.hasProp(modelsCache,cacheKey)){//缓存
				
				modelEntity=modelsCache[cacheKey];

				var updateIdent=modelEntity.get('updateIdent');
				if(updateIdent){//当有更新时，从缓存中删除，防止多次获取该缓存对象导致数据错误
					delete modelsCache[cacheKey];
				}
			}else{
				
				modelEntity=new me.$modelClass(metas.ops);
				modelEntity._after=metas.after;
				modelEntity._cacheKey=cacheKey;
				modelEntity.set('updateIdent',true);
			}
			var updateIdent=modelEntity.get('updateIdent');//是否需要更新
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
					Magix.safeExec(metas.before,modelEntity,metas);
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
});